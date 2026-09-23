import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/utils/auth";

// POST /api/user/signout - Terminate user session
export async function POST(req: NextRequest) {
  try {
    const token =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get("session_token")?.value;

    if (token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.orm.public as any).Session.where({ token }).delete();
      } catch (err) {
        console.error("Failed to delete session record:", err);
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "ออกจากระบบสำเร็จ",
      },
      { status: 200 }
    );

    clearSessionCookie(response);
    return response;
  } catch (error: unknown) {
    console.error("POST /api/user/signout error:", error);
    const response = NextResponse.json(
      {
        success: true,
        message: "ออกจากระบบเรียบร้อย",
      },
      { status: 200 }
    );
    clearSessionCookie(response);
    return response;
  }
}
