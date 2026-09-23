import React from "react";
import SignupForm from "@/components/forms/user/Signup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครสมาชิก / ลงทะเบียน | Yuenyan Single Sign-On",
  description: "ลงทะเบียนบัญชีผู้ใช้งานใหม่สำหรับระบบยืนยันตัวตนรวมศูนย์เทศบาลเมืองแสนสุข",
};

export default function SignUpPage() {
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
        <SignupForm />
      </main>
    </div>
  );
}
