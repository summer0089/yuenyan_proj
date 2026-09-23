import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { departmentSchema } from "@/utils/validations/department_validation";

// GET /api/departments - Fetch all departments
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const departments = await (db.orm.public as any).Departments
      .orderBy((d: { createdAt: { desc: () => unknown } }) => d.createdAt.desc())
      .all();

    return NextResponse.json({
      success: true,
      data: departments,
    });
  } catch (error: unknown) {
    console.error("GET /api/departments error:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถดึงข้อมูลหน่วยงานได้" },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create a new department
export async function POST(req: NextRequest) {
  try {
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

    // Check for duplicate department name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db.orm.public as any).Departments
      .where((d: { name: { eq: (v: string) => unknown } }) => d.name.eq(name))
      .first();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "มีหน่วยงานชื่อนี้อยู่ในระบบแล้ว",
        },
        { status: 409 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await (db.orm.public as any).Departments.create({ name });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มหน่วยงานสำเร็จ",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/departments error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มหน่วยงาน";
    return NextResponse.json(
      {
        success: false,
        message,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
