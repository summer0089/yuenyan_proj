import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { getSessionUserFromRequest } from "@/utils/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleDelete(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Verify Authentication & Authorization (Admin or Superadmin only)
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 }
      );
    }

    const callerRole = sessionUser.role?.trim().toLowerCase();
    if (callerRole !== "admin" && callerRole !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          message: "คุณไม่มีสิทธิ์ในการลบบัญชีผู้ใช้งาน",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสผู้ใช้งาน (ID)" },
        { status: 400 }
      );
    }

    // 2. Prevent self-deletion
    if (sessionUser.id === id) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่สามารถลบบัญชีของตนเองที่กำลังเข้าสู่ระบบอยู่ได้",
        },
        { status: 400 }
      );
    }

    // 3. Check if target user exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetUser = await (db.orm.public as any).User.first({ id });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้งานที่ต้องการลบ" },
        { status: 404 }
      );
    }

    // 4. CRITICAL SECURITY: Never allow deleting a Superadmin account!
    const isTargetSuperAdmin = Boolean(
      targetUser.isSuperAdmin || targetUser.role === "superadmin"
    );
    if (isTargetSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่อนุญาตให้ลบบัญชีผู้ดูแลระบบระดับสูง (Superadmin) ทุกกรณี",
        },
        { status: 403 }
      );
    }

    // 5. Clean up associated child records if any exist
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).Session.where({ userId: id }).delete();
    } catch {
      // ignore if none
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db.orm.public as any).Account.where({ userId: id }).delete();
    } catch {
      // ignore if none
    }

    // 6. Delete User record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).User.where({ id }).delete();

    return NextResponse.json({
      success: true,
      message: `ลบบัญชีผู้ใช้งาน "${targetUser.name || targetUser.email}" สำเร็จเรียบร้อยแล้ว`,
    });
  } catch (error: unknown) {
    console.error("DELETE /api/user/delete/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้งาน";
    return NextResponse.json(
      { success: false, message, error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteParams) {
  return handleDelete(req, context);
}

export async function POST(req: NextRequest, context: RouteParams) {
  return handleDelete(req, context);
}
