import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionJWT, SESSION_COOKIE_NAME } from "@/utils/auth";
import UserManagementForm from "@/components/forms/user/UserManagementForm";

export const metadata: Metadata = {
  title: "บริหารจัดการบัญชีผู้ใช้งาน | Yuenyan Single Sign-On",
  description: "ระบบบริหารจัดการบัญชีผู้ใช้งาน กำหนดสิทธิ์ และดูแลความปลอดภัย",
};

export default async function UserManagementStandardPage() {
  // Server-side Defense-in-depth Role Guard
  const cookieStore = await cookies();
  const token =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/u/signin?callbackUrl=/u/user_management");
  }

  const user = await verifySessionJWT(token);
  if (!user) {
    redirect("/u/signin?callbackUrl=/u/user_management");
  }

  const role = user.role?.trim().toLowerCase();
  if (role !== "admin" && role !== "superadmin") {
    redirect("/forbidden");
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-6 sm:py-8">
      {/* Background Decorative Gradient Blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="w-125 h-125 rounded-full bg-primary/5 blur-3xl opacity-70 transform -translate-y-12" />
        <div className="w-100 h-100 rounded-full bg-indigo-200/20 blur-3xl opacity-50 transform translate-x-32 translate-y-24" />
      </div>

      <main className="w-full">
        <UserManagementForm />
      </main>
    </div>
  );
}
