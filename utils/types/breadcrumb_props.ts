import React from "react";

export interface BreadcrumbItem {
  label: string; // ชื่อหน้า
  href?: string; // ลิงก์ปลายทาง (ถ้าไม่มีหรือเป็นรายการสุดท้าย จะแสดงผลเป็นข้อความ)
  icon?: React.ReactNode; // ไอคอนประกอบ (เช่น Home)
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode; // สัญลักษณ์คั่นระหว่างรายการ (ค่าเริ่มต้น: ChevronRight)
  className?: string;
}
