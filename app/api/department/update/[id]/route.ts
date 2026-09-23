import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { departmentSchema } from "@/utils/validations/department_validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Handler function for updating department
async function handleUpdate(req: NextRequest, { params }: RouteParams) {
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
        { success: false, message: "ไม่พบข้อมูลหน่วยงานที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = departmentSchema.safeParse(body);
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

    const { name } = validation.data;
    const trimmedName = name.trim();

    // Check if duplicate with other departments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const duplicate = await (db.orm.public as any).Department
      .where((d: { name: { eq: (v: string) => unknown } }) => d.name.eq(trimmedName))
      .where((d: { id: { neq: (v: string) => unknown } }) => d.id.neq(id))
      .first();

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "มีหน่วยงานชื่อนี้อยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    // Update department
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (db.orm.public as any).Department
      .where({ id })
      .update({ name: trimmedName });

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อมูลหน่วยงานสำเร็จ",
      data: updated,
    });
  } catch (error: unknown) {
    console.error("PUT/POST /api/department/update/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการแก้ไขหน่วยงาน";
    return NextResponse.json(
      { success: false, message, error: String(error) },
      { status: 500 }
    );
  }
}

// Support both PUT and POST
export async function PUT(req: NextRequest, context: RouteParams) {
  return handleUpdate(req, context);
}

export async function POST(req: NextRequest, context: RouteParams) {
  return handleUpdate(req, context);
}

export async function PATCH(req: NextRequest, context: RouteParams) {
  return handleUpdate(req, context);
}
