import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/utils/auth";

// GET /api/user/session - Get active session user
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("GET /api/user/session error:", error);
    return NextResponse.json(
      {
        success: false,
        user: null,
      },
      { status: 500 }
    );
  }
}
