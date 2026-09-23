import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { createUserSchema } from "@/utils/validations/user_validation";

// POST /api/user/add - Add new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      ...body,
      telephone: body.telephone || body.phoneNumber,
      positionName: body.positionName || body.position,
    };

    const validation = createUserSchema.safeParse(payload);
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

    const {
      email,
      firstName,
      lastName,
      telephone,
      positionName,
      departmentId,
      password,
      role = "user",
      isActive = true,
    } = validation.data;

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db.orm.public as any).User
      .where({ email: normalizedEmail })
      .first();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลนี้มีอยู่ในระบบแล้ว",
        },
        { status: 409 }
      );
    }

    // Verify department exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const department = await (db.orm.public as any).Department
      .where({ id: departmentId })
      .first();

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลหน่วยงานที่เลือก",
        },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Create User record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (db.orm.public as any).User.create({
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      emailVerified: true,
      password: hashedPassword,
      role,
      isSuperAdmin: role === "superadmin",
      permissions: [],
      banned: false,
      twoFactorEnabled: false,
      position: positionName.trim(),
      phoneNumber: telephone.trim(),
      isActive,
      departmentId: department.id,
    });

    // Create Credential Account record for Better-Auth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Account.create({
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มข้อมูลผู้ใช้งานสำเร็จ",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/user/add error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
