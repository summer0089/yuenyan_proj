import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/navigation/NavBar";
import { Footer } from "@/components/navigation/Footer";
import { NavMenuItem } from "@/utils/types/navbar_props";
import {
  Building2,
  Layers,
  Users,
  BarChart3,
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yuenyan : ระบบยืนยันตนรวมศูนย์เทศบาลเมืองแสนสุข",
  description: "ระบบยืนยันตนรวมศูนย์เทศบาลเมืองแสนสุข",
};

// Default Menu Configuration
const DEFAULT_MENUS: NavMenuItem[] = [
  {
    menu_title: "จัดการระบบ",
    icon: <Layers className="w-4 h-4" />,
    roles: ["admin", "superadmin"],
    submenu: [
      {
        title: "ข้อมูลพื้นฐาน",
        icon: <Layers className="w-4 h-4 text-primary" />,
        description: "กำหนดหน่วยงาน ห้องประชุม และอุปกรณ์",
        submenu: [
          {
            title: "หน่วยงานภายใน",
            href: "/i/department",
            icon: <Building2 className="w-3.5 h-3.5 text-primary" />,
            roles: ["admin", "superadmin"],
          },
        ],
      },
      {
        title: "รายงานและสถิติ",
        icon: <BarChart3 className="w-4 h-4 text-amber-600" />,
        description: "สถิติการใช้งานและการอนุมัติ",
        submenu: [
          {
            title: "สถิติการใช้งาน",
            href: "/reports/usage",
            icon: <BarChart3 className="w-3.5 h-3.5 text-amber-500" />,
            roles: ["admin", "superadmin"],
          },
        ],
      },
      {
        title: "จัดการผู้ใช้งานระบบ",
        href: "/u/user_management",
        icon: <Users className="w-4 h-4 text-slate-600" />,
        description: "จัดการสิทธิ์และบัญชีผู้ใช้งาน",
        roles: ["admin", "superadmin"],
      },
    ],
  },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      data-theme="yuenyan"
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavBar
          menus={DEFAULT_MENUS}
        />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
