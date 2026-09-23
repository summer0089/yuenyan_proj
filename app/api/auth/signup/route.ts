import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/prisma/db";
import { signupApiSchema } from "@/utils/validations/signup_form_validation";

// POST /api/auth/signup - Register new general user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate payload with Zod
    const validation = signupApiSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "ข้อมูลที่ส่งมาไม่ถูกต้อง",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      firstName,
      lastName,
      telephone,
      positionName,
      departmentId,
    } = validation.data;

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if email already exists
    const existingUser = await db.orm.public.Users
      .where((u) => u.email.eq(normalizedEmail))
      .first();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลนี้มีผู้ใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น",
        },
        { status: 409 }
      );
    }

    // 3. Verify department exists
    const existingDepartment = await db.orm.public.Departments
      .where((d) => d.id.eq(departmentId))
      .first();

    if (!existingDepartment) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบหน่วยงานที่เลือก กรุณาเลือกหน่วยงานที่มีอยู่ในระบบ",
        },
        { status: 400 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user in database (role is fixed to USER for general signup)
    const newUser = await db.orm.public.Users.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      telephone: telephone.trim(),
      positionName: positionName.trim(),
      departmentId,
      image: validation.data.image ?? null,
      role: "USER",
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "ลงทะเบียนสมาชิกสำเร็จ ยินดีต้อนรับสู่ระบบ Korjong",
        data: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          positionName: newUser.positionName,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/auth/signup error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้งาน";
    return NextResponse.json(
      {
        success: false,
        message,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
