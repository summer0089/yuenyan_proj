import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { getSessionUserFromRequest } from "@/utils/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleSuspend(req: NextRequest, { params }: RouteParams) {
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
          message: "คุณไม่มีสิทธิ์ในการจัดการสถานะบัญชีผู้ใช้งาน",
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

    // 2. Prevent self-suspension
    if (sessionUser.id === id) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่สามารถระงับการใช้งานบัญชีของตนเองได้",
        },
        { status: 400 }
      );
    }

    // 3. Find target user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetUser = await (db.orm.public as any).User.first({ id });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้งาน" },
        { status: 404 }
      );
    }

    // 4. Disallow suspending Superadmin
    const isTargetSuperAdmin = Boolean(
      targetUser.isSuperAdmin || targetUser.role === "superadmin"
    );
    if (isTargetSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่อนุญาตให้ระงับการใช้งานบัญชี Superadmin",
        },
        { status: 403 }
      );
    }

    // Parse body if provided
    let body: { banned?: boolean; banReason?: string; isActive?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty if toggling
    }

    // Determine new banned status
    const newBanned =
      body.banned !== undefined ? Boolean(body.banned) : !Boolean(targetUser.banned);
    const newIsActive =
      body.isActive !== undefined ? Boolean(body.isActive) : !newBanned;
    const banReason =
      body.banReason !== undefined
        ? body.banReason
        : newBanned
        ? "ระงับการใช้งานโดยผู้ดูแลระบบ"
        : null;

    // Update in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (db.orm.public as any).User
      .where({ id })
      .update({
        banned: newBanned,
        isActive: newIsActive,
        banReason,
      });

    // If account was banned, terminate all their active sessions
    if (newBanned) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.orm.public as any).Session.where({ userId: id }).delete();
      } catch {
        // ignore
      }
    }

    const actionText = newBanned ? "ระงับการใช้งาน" : "ปลดระงับการใช้งาน";

    return NextResponse.json({
      success: true,
      message: `${actionText}บัญชี "${updated.name || updated.email}" สำเร็จเรียบร้อยแล้ว`,
      data: {
        id: updated.id,
        banned: updated.banned,
        isActive: updated.isActive,
        banReason: updated.banReason,
      },
    });
  } catch (error: unknown) {
    console.error("POST/PATCH /api/user/suspend/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเปลี่ยนสถานะบัญชี";
    return NextResponse.json(
      { success: false, message, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteParams) {
  return handleSuspend(req, context);
}

export async function PATCH(req: NextRequest, context: RouteParams) {
  return handleSuspend(req, context);
}
