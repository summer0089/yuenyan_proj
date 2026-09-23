import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleDelete(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสหน่วยงาน (ID)" },
        { status: 400 }
      );
    }

    // Check if department exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db.orm.public as any).Department.first({ id });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลหน่วยงานที่ต้องการลบ" },
        { status: 404 }
      );
    }

    // Check if any user belongs to this department
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userInDept = await (db.orm.public as any).User
      .where((u: { departmentId: { eq: (v: string) => unknown } }) => u.departmentId.eq(id))
      .first();

    if (userInDept) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่สามารถลบหน่วยงานนี้ได้ เนื่องจากมีผู้ใช้งานหรือพนักงานสังกัดอยู่",
        },
        { status: 400 }
      );
    }

    // Delete department
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).Department.where({ id }).delete();

    return NextResponse.json({
      success: true,
      message: `ลบหน่วยงาน "${existing.name}" สำเร็จ`,
    });
  } catch (error: unknown) {
    console.error("DELETE /api/department/delete/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบหน่วยงาน";
    return NextResponse.json(
      { success: false, message, error: String(error) },
      { status: 500 }
    );
  }
}

// Support DELETE and POST
export async function DELETE(req: NextRequest, context: RouteParams) {
  return handleDelete(req, context);
}

export async function POST(req: NextRequest, context: RouteParams) {
  return handleDelete(req, context);
}
