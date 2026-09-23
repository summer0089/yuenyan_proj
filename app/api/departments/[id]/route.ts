import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { departmentSchema } from "@/utils/validations/department_validation";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/departments/[id] - Fetch a department by ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const department = await db.orm.public.Departments
      .where({ id })
      .first();

    if (!department) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลหน่วยงานนี้ในระบบ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: department,
    });
  } catch (error: unknown) {
    console.error("GET /api/departments/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน" },
      { status: 500 }
    );
  }
}

// PUT /api/departments/[id] - Update a department by ID
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const validation = departmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Check if target department exists
    const existing = await db.orm.public.Departments
      .where({ id })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลหน่วยงานนี้ในระบบ" },
        { status: 404 }
      );
    }

    // Check if name is taken by another department
    const duplicate = await db.orm.public.Departments
      .where((d) => d.name.eq(name))
      .first();

    if (duplicate && duplicate.id !== id) {
      return NextResponse.json(
        { success: false, message: "มีหน่วยงานชื่อนี้อยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    const updated = await db.orm.public.Departments
      .where({ id })
      .update({ name });

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อมูลหน่วยงานสำเร็จ",
      data: updated,
    });
  } catch (error: unknown) {
    console.error("PUT /api/departments/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลหน่วยงาน" },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] - Delete a department by ID
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.orm.public.Departments
      .where({ id })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลหน่วยงานนี้ในระบบ" },
        { status: 404 }
      );
    }

    // Check foreign key: if users belong to this department
    const assignedUsers = await db.orm.public.Users
      .where({ departmentId: id })
      .all();

    if (assignedUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบได้ เนื่องจากมีผู้ใช้งานสังกัดอยู่ในหน่วยงานนี้ (${assignedUsers.length} คน)`,
        },
        { status: 400 }
      );
    }

    await db.orm.public.Departments.where({ id }).delete();

    return NextResponse.json({
      success: true,
      message: "ลบหน่วยงานสำเร็จ",
    });
  } catch (error: unknown) {
    console.error("DELETE /api/departments/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบหน่วยงาน" },
      { status: 500 }
    );
  }
}
