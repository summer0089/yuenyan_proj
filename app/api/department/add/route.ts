import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { departmentSchema } from "@/utils/validations/department_validation";

// POST /api/department/add - Add new department
export async function POST(req: NextRequest) {
  try {
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

    // Check duplicate department name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db.orm.public as any).Department
      .where((d: { name: { eq: (v: string) => unknown } }) => d.name.eq(trimmedName))
      .first();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "มีชื่อหน่วยงานนี้อยู่ในระบบแล้ว",
        },
        { status: 409 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await (db.orm.public as any).Department.create({
      name: trimmedName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มหน่วยงานสำเร็จ",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/department/add error:", error);
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
