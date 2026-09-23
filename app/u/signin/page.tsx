import React from "react";
import SigninForm from "@/components/forms/user/Signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | Yuenyan Single Sign-On",
  description: "ระบบยืนยันตัวตนรวมศูนย์เทศบาลเมืองแสนสุข เข้าถึงบริการดิจิทัลทั้งหมดด้วยบัญชีเดียว",
};

export default function SignInPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradient Blobs for Large Screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="w-125 h-125 rounded-full bg-primary/5 blur-3xl opacity-70 transform -translate-y-12" />
        <div className="w-100 h-100 rounded-full bg-rose-200/20 blur-3xl opacity-50 transform translate-x-32 translate-y-24" />
      </div>

      {/* Main Centered Container */}
      <main className="w-full flex items-center justify-center">
        <SigninForm />
      </main>
    </div>
  );
}
