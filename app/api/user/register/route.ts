import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { registerUserSchema } from "@/utils/validations/signup_form_validation";

// POST /api/user/register - Register new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Map alternative field names if needed
    const payload = {
      ...body,
      telephone: body.telephone || body.phoneNumber,
      positionName: body.positionName || body.position,
    };

    const validation = registerUserSchema.safeParse(payload);
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
          message: "อีเมลนี้ได้ลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ",
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
      role: "user",
      isSuperAdmin: false,
      permissions: [],
      banned: false,
      twoFactorEnabled: false,
      position: positionName.trim(),
      phoneNumber: telephone.trim(),
      isActive: true,
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
        message: "ลงทะเบียนผู้ใช้งานสำเร็จ",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/user/register error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
