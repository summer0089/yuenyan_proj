/**
 * Access Control Configuration (ไฟล์กำหนดสิทธิ์การเข้าถึงหน้าต่างๆ)
 *
 * ผู้พัฒนาสามารถแก้ไขหรือเพิ่มกฎการเข้าถึงแต่ละเส้นทาง (Route) ได้ในไฟล์นี้:
 *
 * 1. `roles`: ระบุอาร์เรย์ของบทบาทที่อนุญาต เช่น ['admin', 'superadmin']
 *    (หากระบุ roles ระบบจะบังคับว่าต้องเข้าสู่ระบบก่อนเสมอ)
 * 2. `requireAuth`: กำหนดเป็น true หากต้องการให้ผู้ใช้ที่เข้าสู่ระบบแล้วทุกคนเข้าถึงได้ (ทุก role)
 * 3. `guestOnly`: กำหนดเป็น true สำหรับหน้าที่อนุญาตเฉพาะคนที่ "ยังไม่เข้าสู่ระบบ" เช่น หน้า Login / Register
 *    (หากเข้าสู่ระบบแล้วจะถูก Redirect ออกไปยัง defaultRedirectPath อัตโนมัติ)
 * 4. `redirectTo`: กำหนด URL ปลายทางที่ต้องการส่งไปเมื่อไม่ผ่านสิทธิ์ (ถ้าไม่ระบุ จะใช้ค่าเริ่มต้นจากคอนฟิก)
 *
 * การจับคู่เส้นทาง (Path Matching):
 * - เส้นทางแบบเฉพาะเจาะจง: '/u/profile'
 * - เส้นทางแบบกลุ่ม (Wildcard): '/i/*', '/reports/**', '/admin/:path*'
 */

export interface RoutePermissionRule {
  /**
   * เส้นทาง URL ที่ต้องการกำหนดสิทธิ์
   * รองรับ:
   * - เจาะจง: '/u/profile'
   * - Wildcard: '/i/*', '/reports/**', '/admin/:path*'
   */
  path: string;

  /**
   * บทบาทที่อนุญาตให้เข้าใช้งาน เช่น ['admin', 'superadmin']
   */
  roles?: string[];

  /**
   * ต้องเข้าสู่ระบบก่อนหรือไม่ (true = ผู้ใช้ที่ล็อกอินแล้วทุก Role เข้าได้)
   */
  requireAuth?: boolean;

  /**
   * สำหรับผู้ใช้ที่ยังไม่ล็อกอินเท่านั้น (Guest Only) เช่น หน้า Login / Register
   */
  guestOnly?: boolean;

  /**
   * URL ปลายทางที่ต้องการให้ Redirect ไปเมื่อไม่มีสิทธิ์ (Optional)
   */
  redirectTo?: string;
}

export interface AccessControlConfig {
  /**
   * หน้าเข้าสู่ระบบเริ่มต้น
   */
  loginPath: string;

  /**
   * หน้าแจ้งเตือนไม่มีสิทธิ์เข้าถึง (403 Forbidden)
   */
  forbiddenPath: string;

  /**
   * หน้าเริ่มต้นเมื่อล็อกอินแล้ว หรือถูก Redirect จาก Guest Only
   */
  defaultRedirectPath: string;

  /**
   * รายการกฎการเข้าถึงเส้นทางต่างๆ
   */
  rules: RoutePermissionRule[];
}

export const accessControlConfig: AccessControlConfig = {
  loginPath: "/u/signin",
  forbiddenPath: "/forbidden",
  defaultRedirectPath: "/",
  rules: [
    // =========================================================================
    // 1. หน้าสำหรับผู้ที่ยังไม่ได้เข้าสู่ระบบ (Guest Only)
    // =========================================================================
    {
      path: "/u/signin",
      guestOnly: true,
    },
    {
      path: "/u/signup",
      guestOnly: true,
    },
    {
      path: "/u/forgot-password",
      guestOnly: true,
    },

    // =========================================================================
    // 2. หน้าสำหรับผู้ใช้ทั่วไปที่เข้าสู่ระบบแล้ว (Authenticated Users)
    // =========================================================================
    {
      path: "/u/profile",
      requireAuth: true,
    },
    {
      path: "/u/change-password",
      requireAuth: true,
    },

    // =========================================================================
    // 3. หน้าสำหรับผู้ดูแลระบบ (Admin / Superadmin Only)
    // =========================================================================
    {
      path: "/i/department",
      roles: ["admin", "superadmin"],
    },
    {
      path: "/i/*",
      roles: ["admin", "superadmin"],
    },
    {
      path: "/u/user_management",
      roles: ["admin", "superadmin"],
    },
    {
      path: "/u/user_mangement",
      roles: ["admin", "superadmin"],
    },
    {
      path: "/reports/*",
      roles: ["admin", "superadmin"],
    },
  ],
};
