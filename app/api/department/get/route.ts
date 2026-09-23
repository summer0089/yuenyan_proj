import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

// GET /api/department/get - Fetch all departments
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const departments = await (db.orm.public as any).Department
      .orderBy((d: { createdAt: { desc: () => unknown } }) => d.createdAt.desc())
      .all();

    return NextResponse.json({
      success: true,
      data: departments,
    });
  } catch (error: unknown) {
    console.error("GET /api/department/get error:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถดึงข้อมูลหน่วยงานได้" },
      { status: 500 }
    );
  }
}
