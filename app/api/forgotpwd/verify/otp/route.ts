import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { forgotPasswordOtpSchema } from "@/utils/validations/forgot_password_form_validation";

// POST /api/forgotpwd/verify/otp - Verify password reset OTP code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = forgotPasswordOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    const identifier = `forgotpwd:${normalizedEmail}`;

    // Query Verification record matching identifier and value (otp)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (db.orm.public as any).Verification
      .where({
        identifier,
        value: otp,
      })
      .first();

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
        },
        { status: 400 }
      );
    }

    // Check expiration
    const now = new Date();
    const expiry = new Date(record.expiresAt);

    if (now > expiry) {
      // Remove expired OTP
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).Verification
        .where({ id: record.id })
        .delete();

      return NextResponse.json(
        {
          success: false,
          message: "รหัส OTP หมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง",
        },
        { status: 400 }
      );
    }

    // Remove used OTP
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification
      .where({ id: record.id })
      .delete();

    // Create a verified session token for changing password (valid for 15 minutes)
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetIdentifier = `resetauth:${normalizedEmail}`;
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification
      .where({ identifier: resetIdentifier })
      .delete();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification.create({
      identifier: resetIdentifier,
      value: resetToken,
      expiresAt: resetExpiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "ยืนยันรหัส OTP สำเร็จ",
      resetToken,
    });
  } catch (error: unknown) {
    console.error("POST /api/forgotpwd/verify/otp error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการตรวจสอบรหัส OTP";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
