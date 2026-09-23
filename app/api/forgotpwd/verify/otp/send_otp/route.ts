import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { forgotPasswordEmailSchema } from "@/utils/validations/forgot_password_form_validation";
import { sendPasswordResetOtpEmail } from "@/utils/mail";

// POST /api/forgotpwd/verify/otp/send_otp - Send password reset OTP code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = forgotPasswordEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "อีเมลไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase().trim();

    // Check if user exists in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (db.orm.public as any).User
      .where({ email })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบบัญชีผู้ใช้งานที่ใช้อีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลหรือติดต่อผู้ดูแลระบบ",
        },
        { status: 404 }
      );
    }

    if (user.banned || user.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message: "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
    const identifier = `forgotpwd:${email}`;

    // Clean up any existing forgot password OTP for this email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification
      .where({ identifier })
      .delete();

    // Save new OTP record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification.create({
      identifier,
      value: otp,
      expiresAt,
    });

    // Send email via SMTP
    try {
      await sendPasswordResetOtpEmail(email, otp);
    } catch (mailError) {
      console.error("Failed to send password reset OTP via SMTP:", mailError);
      return NextResponse.json(
        {
          success: false,
          message: "ไม่สามารถส่งอีเมลรหัส OTP ได้ กรุณาตรวจสอบการตั้งค่า SMTP หรือลองใหม่อีกครั้ง",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `ระบบได้ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปยังอีเมล ${email} เรียบร้อยแล้ว`,
    });
  } catch (error: unknown) {
    console.error("POST /api/forgotpwd/verify/otp/send_otp error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งรหัส OTP";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
