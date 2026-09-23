import {
  accessControlConfig,
  RoutePermissionRule,
} from "@/config/access_control";
import { UserSessionPayload } from "@/utils/auth";

export interface AccessCheckResult {
  allowed: boolean;
  redirectUrl?: string;
  matchedRule?: RoutePermissionRule;
}

/**
 * ตรวจสอบว่า pathname ตรงกับ pattern หรือไม่
 * รองรับ Exact Match และ Wildcard ('/*', '/**', '/:path*')
 */
export function matchPath(pattern: string, pathname: string): boolean {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  const cleanPattern = pattern.replace(/\/$/, "") || "/";

  // 1. Exact Match
  if (cleanPattern === cleanPath) {
    return true;
  }

  // 2. Wildcard Match (e.g. /i/*, /reports/**, /admin/:path*)
  if (pattern.endsWith("/*") || pattern.endsWith("/**")) {
    const base = pattern.replace(/\/\*{1,2}$/, "");
    return cleanPath === base || cleanPath.startsWith(`${base}/`);
  }

  if (pattern.includes("/:path*")) {
    const base = pattern.replace(/\/:path\*$/, "");
    return cleanPath === base || cleanPath.startsWith(`${base}/`);
  }

  return false;
}

/**
 * ค้นหากฎที่ตรงกับ pathname มากที่สุด (Exact match มีลำดับความสำคัญสูงสุด ตามด้วย Prefix ที่ยาวที่สุด)
 */
export function findMatchingRule(
  pathname: string,
  rules: RoutePermissionRule[] = accessControlConfig.rules
): RoutePermissionRule | undefined {
  const cleanPath = pathname.replace(/\/$/, "") || "/";

  // 1. ตรวจสอบแบบเจาะจง (Exact match) ก่อนเสมอ
  const exact = rules.find((r) => {
    const rClean = r.path.replace(/\/$/, "") || "/";
    return rClean === cleanPath;
  });
  if (exact) {
    return exact;
  }

  // 2. ค้นหาแบบ Wildcard โดยเรียงลำดับจากความยาวเส้นทางมากไปน้อย (Most Specific First)
  const wildcardMatches = rules
    .filter((r) => matchPath(r.path, pathname))
    .sort((a, b) => b.path.length - a.path.length);

  return wildcardMatches[0];
}

/**
 * ตรวจสอบสิทธิ์การเข้าถึงเส้นทาง (Route Access Check)
 *
 * @param pathname เส้นทางที่ร้องขอ (เช่น '/i/department')
 * @param user ข้อมูลเซสชันผู้ใช้งานปัจจุบัน (หรือ null หากยังไม่ได้ล็อกอิน)
 * @returns ผลการตรวจสอบ { allowed: boolean, redirectUrl?: string }
 */
export function checkRouteAccess(
  pathname: string,
  user: UserSessionPayload | null
): AccessCheckResult {
  const rule = findMatchingRule(pathname, accessControlConfig.rules);

  // หากไม่มีกฎตรงกัน -> อนุญาตให้เข้าถึงได้ตามปกติ (Public)
  if (!rule) {
    return { allowed: true };
  }

  const isLoggedIn = Boolean(user && user.id);
  const userRole = user?.role?.trim().toLowerCase();

  // 1. ตรวจสอบกรณี Guest Only (สำหรับหน้าที่ห้ามคนล็อกอินแล้วเข้า เช่น /u/signin, /u/signup)
  if (rule.guestOnly) {
    if (isLoggedIn) {
      return {
        allowed: false,
        redirectUrl: rule.redirectTo || accessControlConfig.defaultRedirectPath,
        matchedRule: rule,
      };
    }
    return { allowed: true, matchedRule: rule };
  }

  // 2. ตรวจสอบกรณีต้องล็อกอินก่อน (มี roles กำหนด หรือ requireAuth = true)
  const requiresAuthentication = Boolean(
    rule.requireAuth || (rule.roles && rule.roles.length > 0)
  );

  if (requiresAuthentication) {
    if (!isLoggedIn) {
      // ยังไม่ได้เข้าสู่ระบบ -> ส่งไปหน้า Login พร้อมแนบ callbackUrl
      const loginBase = rule.redirectTo || accessControlConfig.loginPath;
      const callbackParam = encodeURIComponent(pathname);
      const redirectUrl = `${loginBase}?callbackUrl=${callbackParam}`;

      return {
        allowed: false,
        redirectUrl,
        matchedRule: rule,
      };
    }

    // 3. ตรวจสอบสิทธิ์ตามบทบาท (Role Check)
    if (rule.roles && rule.roles.length > 0) {
      if (!userRole) {
        return {
          allowed: false,
          redirectUrl: rule.redirectTo || accessControlConfig.forbiddenPath,
          matchedRule: rule,
        };
      }

      const hasMatchingRole = rule.roles.some(
        (allowedRole) => allowedRole.trim().toLowerCase() === userRole
      );

      if (!hasMatchingRole) {
        // ไม่มีสิทธิ์ใน Role ดังกล่าว -> ส่งไปหน้า 403 Forbidden
        return {
          allowed: false,
          redirectUrl: rule.redirectTo || accessControlConfig.forbiddenPath,
          matchedRule: rule,
        };
      }
    }
  }

  // ผ่านทุกเงื่อนไขการตรวจสอบ
  return { allowed: true, matchedRule: rule };
}
