import React from "react";
import DepartmentForm from "@/components/form_departments/form";
import { Breadcrumb } from "@/components/form_ui/Breadcrumb";
import { Building } from "lucide-react";

export const metadata = {
  title: "จัดการข้อมูลหน่วยงานภายใน | Korjong ขอจอง",
  description: "ระบบบันทึกและจัดการรายชื่อหน่วยงานภายในองค์กร",
};

export default function DepartmentsPage() {
  return (
    <div className="min-h-full bg-[#f8f9fa] text-slate-800">
      {/* Main Page Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            { label: "หน้าหลัก", href: "/" },
            { label: "การตั้งค่าข้อมูล" },
            { label: "หน่วยงานภายใน" },
          ]}
        />

        {/* Page Title & Description */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
                จัดการข้อมูลหน่วยงานภายใน
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            เพิ่ม แก้ไข และลบรายชื่อหน่วยงานหรือกองภายในองค์กร
            เพื่อนำไปใช้กำหนดสังกัดของผู้ใช้งานและบันทึกประวัติการจองห้องประชุม
          </p>
        </div>

        {/* Department CRUD Form Component */}
        <DepartmentForm />
      </main>
    </div>
  );
}
