import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { changePasswordApiSchema } from "@/utils/validations/forgot_password_form_validation";

// POST /api/user/change_pwd - Change user password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      email: body.email,
      newPassword: body.newPassword || body.password,
    };

    const validation = changePasswordApiSchema.safeParse(payload);
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

    const { email, newPassword } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (db.orm.public as any).User
      .where({ email: normalizedEmail })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลบัญชีผู้ใช้งานที่ระบุ",
        },
        { status: 404 }
      );
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update User record in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).User
      .where({ id: user.id })
      .update({ password: hashedPassword });

    // Update or create Account record for Better-Auth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (db.orm.public as any).Account
      .where({ userId: user.id, providerId: "credential" })
      .first();

    if (account) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).Account
        .where({ id: account.id })
        .update({ password: hashedPassword });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).Account.create({
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
      });
    }

    // Clean up reset authorization token if exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Verification
      .where({ identifier: `resetauth:${normalizedEmail}` })
      .delete();

    return NextResponse.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว",
    });
  } catch (error: unknown) {
    console.error("POST /api/user/change_pwd error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
