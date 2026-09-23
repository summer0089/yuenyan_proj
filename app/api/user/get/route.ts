import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { getSessionUserFromRequest } from "@/utils/auth";

// GET /api/user/get - Fetch all users for admin & superadmin
export async function GET(req: NextRequest) {
  try {
    // 1. Check authentication & authorization (Admin or Superadmin only)
    const sessionUser = await getSessionUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 }
      );
    }

    const userRole = sessionUser.role?.trim().toLowerCase();
    if (userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้งาน (เฉพาะ Admin และ Superadmin)",
        },
        { status: 403 }
      );
    }

    // 2. Fetch all departments to map department names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const departments = await (db.orm.public as any).Department.all();
    const deptMap: Record<string, string> = {};
    if (Array.isArray(departments)) {
      departments.forEach((dept: { id: string; name: string }) => {
        if (dept.id && dept.name) {
          deptMap[dept.id] = dept.name;
        }
      });
    }

    // 3. Fetch all users ordered by createdAt desc
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawUsers = await (db.orm.public as any).User
      .orderBy((u: { createdAt: { desc: () => unknown } }) => u.createdAt.desc())
      .all();

    if (!Array.isArray(rawUsers)) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    // 4. Sanitize and format user data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = rawUsers.map((u: any) => ({
      id: u.id,
      name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "-",
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email,
      role: u.role || "user",
      isSuperAdmin: Boolean(u.isSuperAdmin || u.role === "superadmin"),
      banned: Boolean(u.banned),
      banReason: u.banReason || null,
      isActive: u.isActive !== undefined ? Boolean(u.isActive) : !u.banned,
      position: u.position || "-",
      phoneNumber: u.phoneNumber || "-",
      departmentId: u.departmentId || "",
      departmentName: u.departmentId ? deptMap[u.departmentId] || "-" : "-",
      image: u.image || null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      lastLoginAt: u.lastLoginAt || null,
    }));

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error: unknown) {
    console.error("GET /api/user/get error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน";
    return NextResponse.json(
      { success: false, message, error: String(error) },
      { status: 500 }
    );
  }
}
