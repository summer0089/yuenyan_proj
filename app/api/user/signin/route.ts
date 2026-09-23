import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { signinSchema } from "@/utils/validations/signin_form_validation";
import {
  signSessionJWT,
  setSessionCookie,
  UserSessionPayload,
} from "@/utils/auth";

// POST /api/user/signin - Authenticate user and issue Better-Auth JWT session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate inputs with Zod
    const validation = signinSchema.safeParse(body);
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

    const { email, password, rememberMe } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user in PostgreSQL database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (db.orm.public as any).User
      .where({ email: normalizedEmail })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            "บัญชีผู้ใช้นี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 403 }
      );
    }

    // Check if user is banned
    if (user.banned === true) {
      return NextResponse.json(
        {
          success: false,
          message:
            user.banReason ||
            "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 403 }
      );
    }

    // Verify password
    let isPasswordValid = false;
    if (user.password) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    // Fallback: check Credential Account if user.password didn't match or wasn't set
    if (!isPasswordValid) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (db.orm.public as any).Account
        .where({
          userId: user.id,
          providerId: "credential",
        })
        .first();

      if (account?.password) {
        isPasswordValid = await bcrypt.compare(password, account.password);
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        },
        { status: 401 }
      );
    }

    // Fetch department details
    let departmentName = "";
    if (user.departmentId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const department = await (db.orm.public as any).Department
        .where({ id: user.departmentId })
        .first();
      if (department?.name) {
        departmentName = department.name;
      }
    }

    // Prepare session payload as requested:
    // id, ชื่อจริง, นามสกุล, ตำแหน่ง, หน่วยงานที่สังกัด, หมายเลขโทรศัพท์, role, image_url
    const sessionUser: UserSessionPayload = {
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      name:
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "ผู้ใช้งาน",
      position: user.position || "",
      department: departmentName,
      phoneNumber: user.phoneNumber || "",
      role: user.role || "user",
      image_url: user.image || null,
      email: user.email,
    };

    // Calculate session duration (30 days if rememberMe, otherwise 7 days)
    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

    // Create JWT Session token using Better-Auth crypto
    const sessionToken = await signSessionJWT(sessionUser, maxAgeSeconds);

    // Save session in PostgreSQL Session table
    try {
      const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000).toISOString();
      const ipAddress =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null;
      const userAgent = req.headers.get("user-agent") || null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).Session.create({
        token: sessionToken,
        userId: user.id,
        expiresAt,
        ipAddress,
        userAgent,
      });

      // Update user lastLoginAt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).User
        .where({ id: user.id })
        .update({ lastLoginAt: new Date().toISOString() });
    } catch (sessionDbError) {
      console.error("Warning: Failed to save session to database:", sessionDbError);
    }

    // Create response and set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        user: sessionUser,
        token: sessionToken,
        redirectTo: "/p/home",
      },
      { status: 200 }
    );

    setSessionCookie(response, sessionToken, maxAgeSeconds);

    return response;
  } catch (error: unknown) {
    console.error("POST /api/user/signin error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
