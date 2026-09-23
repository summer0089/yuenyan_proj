import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { Button } from "@/components/form_controls/Button";

export const metadata: Metadata = {
  title: "403 Forbidden - ไม่มีสิทธิ์เข้าถึง | Yuenyan",
  description: "คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้",
};

export default function ForbiddenPage() {
  return (
    <main className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md text-center">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-sm mb-6 animate-in zoom-in-95 duration-200">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Status Code & Headings */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/80 text-red-700 text-xs font-semibold uppercase tracking-wider mb-3">
          Error 403 • Access Denied
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-8">
          บทบาทบัญชีของคุณไม่ได้รับอนุญาตให้เข้าใช้งานในส่วนนี้
          หากคุณเชื่อว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบเพื่อขอรับสิทธิ์
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              text="กลับสู่หน้าหลัก"
              icon={<Home className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-sm"
            />
          </Link>

          <Link href="/u/signin" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              text="เข้าสู่ระบบด้วยบัญชีอื่น"
              icon={<LogIn className="w-4 h-4" />}
              className="w-full sm:w-auto"
            />
          </Link>
        </div>

        {/* Subtle footer note */}
        <p className="text-xs text-slate-400 mt-10">
          ระบบยืนยันตนรวมศูนย์เทศบาลเมืองแสนสุข
        </p>
      </div>
    </main>
  );
}
