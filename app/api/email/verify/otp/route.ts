import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "กรุณาระบุอีเมล")
    .pipe(z.string().email("รูปแบบอีเมลไม่ถูกต้อง")),
  otp: z
    .string()
    .trim()
    .length(6, "รหัส OTP ต้องมีความยาว 6 หลัก")
    .regex(/^\d{6}$/, "รหัส OTP ต้องเป็นตัวเลข 6 หลัก"),
});

// POST /api/email/verify/otp - Verify OTP code entered by user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = verifyOtpSchema.safeParse(body);
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

    // Query Verification record matching identifier (email) and value (otp)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (db.orm.public as any).Verification
      .where({
        identifier: normalizedEmail,
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
          message: "รหัส OTP หมดอายุแล้ว กรุณากดขอรหัส OTP ใหม่อีกครั้ง",
        },
        { status: 400 }
      );
    }

    // Verification successful: Clean up used OTP
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification
      .where({ id: record.id })
      .delete();

    return NextResponse.json({
      success: true,
      message: "ยืนยันอีเมลสำเร็จ",
    });
  } catch (error: unknown) {
    console.error("POST /api/email/verify/otp error:", error);
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
