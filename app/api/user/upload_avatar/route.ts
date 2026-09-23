import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/prisma/db";
import {
  getSessionUserFromRequest,
  setSessionCookie,
  signSessionJWT,
  UserSessionPayload,
} from "@/utils/auth";

// POST /api/user/upload_avatar - Upload & save cropped 100x100 avatar for the account owner
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลรูปภาพที่ต้องการอัปโหลด",
        },
        { status: 400 }
      );
    }

    // Extract base64 payload
    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json(
        {
          success: false,
          message: "รูปแบบข้อมูลรูปภาพไม่ถูกต้อง (ต้องการ Base64 Data URL)",
        },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(matches[2], "base64");

    // Ensure directory exists
    const avatarDir = path.join(process.cwd(), "public", "user_avatar");
    await fs.mkdir(avatarDir, { recursive: true });

    // Save avatar file named after user ID
    const filename = `avatar_${sessionUser.id}.jpg`;
    const filePath = path.join(avatarDir, filename);
    await fs.writeFile(filePath, imageBuffer);

    const imageUrl = `/user_avatar/${filename}`;

    // Update User record in PostgreSQL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.orm.public as any).User
      .where({ id: sessionUser.id })
      .update({ image: imageUrl });

    // Update JWT session with new image
    const updatedSessionUser: UserSessionPayload = {
      ...sessionUser,
      image_url: imageUrl,
    };

    const sessionToken = await signSessionJWT(updatedSessionUser);

    const response = NextResponse.json({
      success: true,
      message: "อัปโหลดและบันทึกรูปภาพโปรไฟล์เรียบร้อยแล้ว",
      imageUrl,
    });

    setSessionCookie(response, sessionToken);

    return response;
  } catch (error: unknown) {
    console.error("POST /api/user/upload_avatar error:", error);
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
