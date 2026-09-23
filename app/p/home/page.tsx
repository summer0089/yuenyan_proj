"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserSessionPayload } from "@/utils/auth";
import {
  Calendar,
  CalendarDays,
  PlusCircle,
  Building2,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<UserSessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/user/session");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    const handleAuthChange = () => {
      loadSession();
    };
    window.addEventListener("auth-state-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChange);
    };
  }, []);

  // Quick Service Items
  const services = [
    {
      title: "จองห้องประชุมใหม่",
      description: "เลือกห้องประชุม วันที่ และช่วงเวลาที่ต้องการใช้งานได้อย่างสะดวกรวดเร็ว",
      href: "/bookings/new",
      icon: <PlusCircle className="w-6 h-6 text-primary" />,
      tag: "บริการหลัก",
      tagColor: "bg-primary-light text-primary",
    },
    {
      title: "ปฏิทินการใช้ห้องประชุม",
      description: "ตรวจสอบตารางเวลาห้องประชุมแบบเรียลไทม์ หลีกเลี่ยงช่วงเวลาที่ซ้ำซ้อน",
      href: "/calendar",
      icon: <Calendar className="w-6 h-6 text-emerald-600" />,
      tag: "เรียลไทม์",
      tagColor: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "รายการจองของฉัน",
      description: "ตรวจสอบสถานะการอนุมัติ ประวัติ และจัดการรายการจองห้องประชุม",
      href: "/u/bookings",
      icon: <CalendarDays className="w-6 h-6 text-purple-600" />,
      tag: "ส่วนบุคคล",
      tagColor: "bg-purple-50 text-purple-700",
    },
    {
      title: "จัดการข้อมูลส่วนตัว",
      description: "อัปเดตข้อมูลการติดต่อ สังกัด และตั้งค่าความปลอดภัยของบัญชีผู้ใช้",
      href: "/u/profile",
      icon: <User className="w-6 h-6 text-amber-600" />,
      tag: "บัญชีผู้ใช้",
      tagColor: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="min-h-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl p-6 sm:p-10 mb-8 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-emerald-300 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ระบบยืนยันตัวตนรวมศูนย์ เทศบาลเมืองแสนสุข (SSO)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            {loading ? (
              <span>ยินดีต้อนรับสู่ระบบ Yuenyan</span>
            ) : user ? (
              <span>ยินดีต้อนรับ, {user.name}</span>
            ) : (
              <span>ยินดีต้อนรับสู่ระบบงานกลาง</span>
            )}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-6">
            เข้าถึงระบบงานจองห้องประชุมและบริการดิจิทัลทั้งหมดของเทศบาลเมืองแสนสุขได้อย่างปลอดภัยและรวดเร็ว
          </p>

          {/* User Details Pill if logged in */}
          {user && (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm">
              {user.department && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>สังกัด: <strong>{user.department}</strong></span>
                </div>
              )}

              {user.position && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>ตำแหน่ง: <strong>{user.position}</strong></span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>สถานะ: เข้าสู่ระบบแล้ว ({user.role})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              บริการดิจิทัลและระบบงาน
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              เลือกใช้งานระบบที่ต้องการตามภารกิจงานของคุณ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-primary-light flex items-center justify-center transition-colors">
                    {item.icon}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${item.tagColor}`}
                  >
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all pt-2 border-t border-slate-100">
                <span>เข้าใช้งาน</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Summary Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-xs text-primary shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              ความปลอดภัยมาตรฐาน
            </div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              ปกป้องข้อมูลด้วย Better-Auth และ JWT Session ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-xs text-emerald-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              ระบบจองห้องประชุมทันสมัย
            </div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              ติดตามสถานะการจองแบบเรียลไทม์ แจ้งเตือนการอนุมัติผ่านระบบอัตโนมัติ
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-xs text-purple-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              เชื่อมต่อทุกกอง/สำนัก
            </div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              ประสานงานระหว่างหน่วยงานภายในเทศบาลเมืองแสนสุขอย่างไร้รอยต่อ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
