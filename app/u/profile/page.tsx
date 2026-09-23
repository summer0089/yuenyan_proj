import React from "react";
import type { Metadata } from "next";
import EditProfileForm from "@/components/forms/user/EditProfileForm";

export const metadata: Metadata = {
  title: "แก้ไขข้อมูลส่วนตัว | Yuenyan Single Sign-On",
  description: "จัดการข้อมูลส่วนตัว บัญชีผู้ใช้งาน สังกัดหน่วยงาน และรูปภาพโปรไฟล์",
};

export default function ProfilePage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradient Blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="w-lg h-lg rounded-full bg-primary/5 blur-3xl opacity-60 transform -translate-y-16" />
        <div className="w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl opacity-50 transform translate-x-40 translate-y-32" />
      </div>

      <main className="w-full">
        <EditProfileForm />
      </main>
    </div>
  );
}
