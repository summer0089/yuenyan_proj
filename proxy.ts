import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/utils/auth";
import { checkRouteAccess } from "@/utils/access_control";

/**
 * Next.js 16 Request Proxy (แทนที่ middleware.ts เดิม)
 * ดักจับและตรวจสอบสิทธิ์ก่อนที่หน้าเพจจะถูกประมวลผล
 */
export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. รับข้อมูลผู้ใช้จากเซสชันคุกกี้
  const user = await getSessionUserFromRequest(req);

  // 2. ตรวจสอบสิทธิ์การเข้าถึงตาม config ใน config/access_control.ts
  const access = checkRouteAccess(pathname, user);

  if (!access.allowed && access.redirectUrl) {
    const redirectUrl = new URL(access.redirectUrl, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * ตรวจสอบทุกเส้นทาง ยกเว้น:
     * - /api/* (API endpoints จัดการสิทธิ์ด้วย API guards)
     * - /_next/static (Static files เช่น CSS, JS)
     * - /_next/image (Image optimization)
     * - favicon.ico และไฟล์รูปภาพ static ต่างๆ
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
