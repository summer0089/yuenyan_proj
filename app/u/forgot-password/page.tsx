import React from "react";
import ForgotPassowrdForm from "@/components/forms/user/ForgotPassword";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน | Yuenyan Single Sign-On",
  description: "ขอรับลิงก์สำหรับรีเซ็ตรหัสผ่านบัญชีผู้ใช้ระบบยืนยันตัวตนรวมศูนย์เทศบาลเมืองแสนสุข",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradient Blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="w-125 h-125 rounded-full bg-primary/5 blur-3xl opacity-70 transform -translate-y-12" />
        <div className="w-100 h-100 rounded-full bg-rose-200/20 blur-3xl opacity-50 transform translate-x-32 translate-y-24" />
      </div>

      <main className="w-full flex items-center justify-center">
        <ForgotPassowrdForm />
      </main>
    </div>
  );
}
