import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { emailStepSchema } from "@/utils/validations/signup_form_validation";
import { sendOtpEmail } from "@/utils/mail";

// POST /api/email/verify/send_otp - Send 6-digit OTP code to user's email via SMTP
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = emailStepSchema.safeParse(body);
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

    // Check if email already registered in system
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = await (db.orm.public as any).User
      .where((u: { email: { eq: (val: string) => unknown } }) => u.email.eq(email))
      .first();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "อีเมลนี้ได้ลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ",
        },
        { status: 409 }
      );
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Clean up any existing OTP for this email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification
      .where((v: { identifier: { eq: (val: string) => unknown } }) => v.identifier.eq(email))
      .delete();

    // Save new OTP record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification.create({
      identifier: email,
      value: otp,
      expiresAt,
    });

    // Send email via SMTP
    try {
      await sendOtpEmail(email, otp);
    } catch (mailError) {
      console.error("Failed to send OTP email via SMTP:", mailError);
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
      message: `ระบบได้ส่งรหัส OTP ไปยังอีเมล ${email} เรียบร้อยแล้ว`,
    });
  } catch (error: unknown) {
    console.error("POST /api/email/verify/send_otp error:", error);
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
