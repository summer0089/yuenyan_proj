import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { getSessionUserFromRequest } from "@/utils/auth";
import { changePasswordOwnerSchema } from "@/utils/validations/user_validation";

// POST /api/user/change_password - Change password for the currently logged-in account owner
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = changePasswordOwnerSchema.safeParse(body);
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

    const { currentPassword, newPassword } = validation.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (db.orm.public as any).User
      .where({ id: sessionUser.id })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้งาน",
        },
        { status: 404 }
      );
    }

    // Verify current password
    let isCurrentValid = false;
    if (user.password) {
      isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    }

    if (!isCurrentValid) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const account = await (db.orm.public as any).Account
        .where({ userId: user.id, providerId: "credential" })
        .first();

      if (account?.password) {
        isCurrentValid = await bcrypt.compare(currentPassword, account.password);
      }
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update User record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).User
      .where({ id: user.id })
      .update({ password: hashedPassword });

    // Update or create Account record for Better-Auth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingAccount = await (db.orm.public as any).Account
      .where({ userId: user.id, providerId: "credential" })
      .first();

    if (existingAccount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).Account
        .where({ id: existingAccount.id })
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

    return NextResponse.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว",
    });
  } catch (error: unknown) {
    console.error("POST /api/user/change_password error:", error);
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
