import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import {
  getSessionUserFromRequest,
  setSessionCookie,
  signSessionJWT,
  UserSessionPayload,
} from "@/utils/auth";
import { editProfileSchema } from "@/utils/validations/user_validation";

// GET /api/user/profile - Get profile of the currently logged-in account owner
export async function GET(req: NextRequest) {
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

    let departmentName = "";
    if (user.departmentId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dept = await (db.orm.public as any).Department
        .where({ id: user.departmentId })
        .first();
      if (dept) departmentName = dept.name;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        position: user.position,
        phoneNumber: user.phoneNumber,
        departmentId: user.departmentId,
        departmentName,
        image: user.image || null,
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลส่วนตัว",
      },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update profile for the account owner ONLY
export async function PUT(req: NextRequest) {
  try {
    // 1. Verify that user has an active session
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

    // 2. Strict owner-only check: cannot pass someone else's ID
    if (body.id && body.id !== sessionUser.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "คุณไม่มีสิทธิ์แก้ไขข้อมูลของผู้อื่น ผู้ใช้งานเจ้าของบัญชีเท่านั้นที่สามารถแก้ไขข้อมูลได้",
        },
        { status: 403 }
      );
    }

    // Map telephone & position if alternative keys used
    const payload = {
      ...body,
      telephone: body.telephone || body.phoneNumber,
      positionName: body.positionName || body.position,
    };

    const validation = editProfileSchema.safeParse(payload);
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

    const {
      firstName,
      lastName,
      telephone,
      positionName,
      departmentId,
      image,
    } = validation.data;

    // Verify department exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const department = await (db.orm.public as any).Department
      .where({ id: departmentId })
      .first();

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลหน่วยงานที่เลือก",
        },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      phoneNumber: telephone.trim(),
      position: positionName.trim(),
      departmentId: department.id,
    };

    if (image !== undefined) {
      updateData.image = image;
    }

    // Perform database update strictly on sessionUser.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedUser = await (db.orm.public as any).User
      .where({ id: sessionUser.id })
      .update(updateData);

    // Prepare updated session payload
    const updatedSessionUser: UserSessionPayload = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      name: updatedUser.name,
      position: updatedUser.position,
      department: department.name,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      image_url: updatedUser.image || null,
      email: updatedUser.email,
    };

    // Re-issue JWT session token so all parts of the application (NavBar) sync immediately
    const sessionToken = await signSessionJWT(updatedSessionUser);

    const response = NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลส่วนตัวสำเร็จเรียบร้อยแล้ว",
      data: updatedSessionUser,
    });

    setSessionCookie(response, sessionToken);

    return response;
  } catch (error: unknown) {
    console.error("PUT /api/user/profile error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
