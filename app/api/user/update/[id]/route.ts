import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { updateUserSchema } from "@/utils/validations/user_validation";
import { getSessionUserFromRequest } from "@/utils/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleUpdate(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Verify Authentication & Authorization (Admin or Superadmin only)
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 }
      );
    }

    const callerRole = sessionUser.role?.trim().toLowerCase();
    if (callerRole !== "admin" && callerRole !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          message: "คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้งาน",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสผู้ใช้งาน (ID)" },
        { status: 400 }
      );
    }

    // Check if user exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = await (db.orm.public as any).User.first({ id });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้งานที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const payload = {
      ...body,
      telephone: body.telephone || body.phoneNumber,
      positionName: body.positionName || body.position,
    };

    const validation = updateUserSchema.safeParse(payload);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: Record<string, any> = {};

    // Email update & check uniqueness
    if (data.email) {
      const normalizedEmail = data.email.toLowerCase().trim();
      if (normalizedEmail !== existingUser.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const duplicate = await (db.orm.public as any).User
          .where((u: { email: { eq: (v: string) => unknown }; id: { neq: (v: string) => unknown } }) =>
            u.email.eq(normalizedEmail)
          )
          .where((u: { id: { neq: (v: string) => unknown } }) => u.id.neq(id))
          .first();

        if (duplicate) {
          return NextResponse.json(
            { success: false, message: "มีผู้ใช้งานใช้อีเมลนี้อยู่ในระบบแล้ว" },
            { status: 409 }
          );
        }
        updateFields.email = normalizedEmail;
      }
    }

    // Name update
    const newFirstName = data.firstName !== undefined ? data.firstName.trim() : existingUser.firstName;
    const newLastName = data.lastName !== undefined ? data.lastName.trim() : existingUser.lastName;
    if (data.firstName !== undefined) updateFields.firstName = newFirstName;
    if (data.lastName !== undefined) updateFields.lastName = newLastName;
    if (data.firstName !== undefined || data.lastName !== undefined) {
      updateFields.name = `${newFirstName} ${newLastName}`.trim();
    }

    // Position & Phone
    if (data.positionName !== undefined) updateFields.position = data.positionName.trim();
    if (data.telephone !== undefined) updateFields.phoneNumber = data.telephone.trim();

    // Department check & update
    if (data.departmentId !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const department = await (db.orm.public as any).Department.first({ id: data.departmentId });
      if (!department) {
        return NextResponse.json(
          { success: false, message: "ไม่พบข้อมูลหน่วยงานที่เลือก" },
          { status: 400 }
        );
      }
      updateFields.departmentId = data.departmentId;
    }

    // Role & Active & Banned
    if (data.role !== undefined) {
      updateFields.role = data.role;
      updateFields.isSuperAdmin = data.role === "superadmin";
    }
    if (data.isActive !== undefined) updateFields.isActive = data.isActive;
    if (body.banned !== undefined) {
      updateFields.banned = Boolean(body.banned);
      if (body.banReason !== undefined) {
        updateFields.banReason = body.banReason;
      }
    }

    // Password update with bcrypt hashing
    if (data.password && data.password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updateFields.password = hashedPassword;

      // Also update or create credential Account for Better-Auth
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingAccount = await (db.orm.public as any).Account
        .where({ userId: id, providerId: "credential" })
        .first();

      if (existingAccount) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.orm.public as any).Account
          .where({ id: existingAccount.id })
          .update({ password: hashedPassword });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.orm.public as any).Account.create({
          accountId: id,
          providerId: "credential",
          userId: id,
          password: hashedPassword,
        });
      }
    }

    // Update User record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedUser = await (db.orm.public as any).User
      .where({ id })
      .update(updateFields);

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อมูลผู้ใช้งานสำเร็จ",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        position: updatedUser.position,
        phoneNumber: updatedUser.phoneNumber,
        departmentId: updatedUser.departmentId,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error: unknown) {
    console.error("PUT/POST/PATCH /api/user/update/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้งาน";
    return NextResponse.json(
      { success: false, message, error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteParams) {
  return handleUpdate(req, context);
}

export async function POST(req: NextRequest, context: RouteParams) {
  return handleUpdate(req, context);
}

export async function PATCH(req: NextRequest, context: RouteParams) {
  return handleUpdate(req, context);
}
