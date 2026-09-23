"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  NavBarProps,
  NavMenuItem,
  UserProfile,
} from "@/utils/types/navbar_props";
import { Button } from "@/components/form_ui/Button";
import {
  ChevronDown,
  User,
  CalendarDays,
  LogOut,
  LogIn,
  Menu,
  X,
  Building2,
  Calendar,
  Layers,
  Users,
  BarChart3,
  PlusCircle,
  DoorClosed,
  Home,
} from "lucide-react";

// Default Menu Configuration
const DEFAULT_MENUS: NavMenuItem[] = [
  {
    menu_title: "หน้าหลัก",
    href: "/",
    icon: <Home className="w-4 h-4" />,
  },
  {
    menu_title: "การจองห้องประชุม",
    icon: <Calendar className="w-4 h-4" />,
    submenu: [
      {
        title: "จองห้องประชุมใหม่",
        href: "/bookings/new",
        icon: <PlusCircle className="w-4 h-4 text-[#1a73e8]" />,
        description: "เลือกห้องประชุม วันและช่วงเวลาที่ต้องการ",
      },
      {
        title: "ปฏิทินการใช้ห้องประชุม",
        href: "/calendar",
        icon: <Calendar className="w-4 h-4 text-emerald-600" />,
        description: "ตรวจสอบตารางเวลาห้องประชุมแบบเรียลไทม์",
      },
      {
        title: "รายการจองของฉัน",
        href: "/u/bookings",
        icon: <CalendarDays className="w-4 h-4 text-purple-600" />,
        description: "ตรวจสอบสถานะและประวัติการจองห้องประชุม",
      },
    ],
  },
  {
    menu_title: "จัดการระบบ",
    icon: <Layers className="w-4 h-4" />,
    submenu: [
      {
        title: "ข้อมูลพื้นฐาน",
        icon: <Layers className="w-4 h-4 text-blue-600" />,
        description: "กำหนดหน่วยงาน ห้องประชุม และอุปกรณ์",
        submenu: [
          {
            title: "หน่วยงานภายใน",
            href: "/c/departments",
            icon: <Building2 className="w-3.5 h-3.5 text-blue-500" />,
          },
          {
            title: "ห้องประชุมและสถานที่",
            href: "/c/rooms",
            icon: <DoorClosed className="w-3.5 h-3.5 text-blue-500" />,
          },
        ],
      },
      {
        title: "รายงานและสถิติ",
        icon: <BarChart3 className="w-4 h-4 text-amber-600" />,
        description: "สถิติการใช้งานและการอนุมัติ",
        submenu: [
          {
            title: "สถิติการใช้งานห้องประชุม",
            href: "/reports/usage",
            icon: <BarChart3 className="w-3.5 h-3.5 text-amber-500" />,
          },
          {
            title: "ประวัติการอนุมัติการจอง",
            href: "/reports/approvals",
            icon: <CalendarDays className="w-3.5 h-3.5 text-amber-500" />,
          },
        ],
      },
      {
        title: "จัดการผู้ใช้งานระบบ",
        href: "/c/users",
        icon: <Users className="w-4 h-4 text-slate-600" />,
        description: "จัดการสิทธิ์และบัญชีผู้ใช้งาน",
      },
    ],
  },
];

// Default User Profile
const DEFAULT_USER: UserProfile = {
  name: "เจ้าหน้าที่ผู้ดูแลระบบ",
  email: "admin@korjong.local",
  role: "ผู้ดูแลระบบ (Admin)",
  profile_image: "/user_avatar/test_avatar.jpg",
};

export function NavBar({
  logoSrc = "/logo_korjong_64.png",
  logoHref = "/",
  logoAlt = "Korjong Logo",
  title = "Korjong : ขอจอง",
  badge = "ระบบจองห้องประชุม",
  menus = DEFAULT_MENUS,
  user = DEFAULT_USER,
  isLoggedIn = true,
  onLogout,
  hiddenPaths = ["/u/signin", "/u/signup", "/u/forgot-password"],
  hidden = false,
  className = "",
}: NavBarProps) {
  const pathname = usePathname();

  // Mobile menu state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Active desktop dropdown menu
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // Open accordion keys for level-2 submenus: Record<string, boolean>
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(
    {}
  );

  // User panel dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Simulated logged-in state (if user passed explicitly, honors it)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    isLoggedIn ? user : null
  );

  // Container refs for click-outside
  const navRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
    setActiveMenuIndex(null);
    setIsUserMenuOpen(false);
  }

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setActiveMenuIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if current page is in hiddenPaths
  const isHiddenPage = useMemo(() => {
    if (hidden) return true;
    if (!pathname) return false;
    return hiddenPaths.some((path) => {
      if (pathname === path) return true;
      if (path !== "/" && pathname.startsWith(`${path}/`)) return true;
      return false;
    });
  }, [hidden, pathname, hiddenPaths]);

  if (isHiddenPage) {
    return null;
  }

  // Accordion toggle handler
  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Sign out handler
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      setCurrentUser(null);
      setIsUserMenuOpen(false);
    }
  };

  return (
    <header
      ref={navRef}
      className={`bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs select-none ${className}`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* ========================================================================= */}
        {/* LEFT SECTION: Logo & Brand Title (Far Left) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={logoHref}
            className="flex items-center gap-2.5 group transition-transform active:scale-98"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-800 tracking-tight group-hover:text-[#1a73e8] transition-colors leading-tight">
                {title}
              </span>
            </div>
          </Link>

          {badge && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-300 font-light">|</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#1a73e8] border border-blue-100">
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CENTER / DESKTOP NAVIGATION MENU */}
        {/* ========================================================================= */}
        <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-start ml-6">
          {menus.map((item, menuIdx) => {
            const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
            const isOpen = activeMenuIndex === menuIdx;

            if (!hasSubmenu) {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.menu_title}
                  href={item.href || "#"}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "text-[#1a73e8] bg-blue-50/80 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.menu_title}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <div key={item.menu_title} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuIndex(isOpen ? null : menuIdx)
                  }
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isOpen
                      ? "text-[#1a73e8] bg-blue-50/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  aria-expanded={isOpen}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.menu_title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#1a73e8]" : "text-slate-400"
                      }`}
                  />
                </button>

                {/* Desktop Dropdown Menu Panel */}
                {isOpen && (
                  <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 pb-2 mb-1 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {item.menu_title}
                    </div>

                    <div className="space-y-1 px-1.5">
                      {item.submenu?.map((sub, subIdx) => {
                        const hasNestedSub = Boolean(
                          sub.submenu && sub.submenu.length > 0
                        );
                        const accordionKey = `${menuIdx}-${subIdx}`;
                        const isAccordionOpen = Boolean(
                          openAccordions[accordionKey]
                        );

                        // If Submenu has nested items -> Render as ACCORDION
                        if (hasNestedSub) {
                          return (
                            <div
                              key={sub.title}
                              className="rounded-xl overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() => toggleAccordion(accordionKey)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${isAccordionOpen
                                    ? "bg-blue-50/70 text-[#1a73e8]"
                                    : "text-slate-700 hover:bg-slate-50"
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {sub.icon && <span>{sub.icon}</span>}
                                  <span>{sub.title}</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isAccordionOpen
                                      ? "rotate-180 text-[#1a73e8]"
                                      : "text-slate-400"
                                    }`}
                                />
                              </button>

                              {/* Nested Accordion Content */}
                              {isAccordionOpen && (
                                <div className="pl-6 pr-2 py-1 space-y-0.5 border-l-2 border-blue-200 ml-4 mt-1 mb-1">
                                  {sub.submenu?.map((nested) => {
                                    const isNestedActive =
                                      pathname === nested.href;
                                    return (
                                      <Link
                                        key={nested.title}
                                        href={nested.href || "#"}
                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${isNestedActive
                                            ? "font-semibold text-[#1a73e8] bg-blue-50"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                          }`}
                                      >
                                        {nested.icon && (
                                          <span>{nested.icon}</span>
                                        )}
                                        <span>{nested.title}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular Submenu item (No nested items)
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.title}
                            href={sub.href || "#"}
                            className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${isSubActive
                                ? "bg-blue-50 text-[#1a73e8] font-semibold"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                          >
                            {sub.icon && (
                              <div className="mt-0.5 shrink-0">{sub.icon}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium leading-tight">
                                {sub.title}
                              </div>
                              {sub.description && (
                                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                  {sub.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ========================================================================= */}
        {/* RIGHT SECTION: User Panel / Login Button (Far Right) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {currentUser ? (
            /* Logged-in User Avatar & Panel */
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20"
                aria-label="User profile menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-linear-to-tr from-blue-500 to-indigo-600 ring-2 ring-slate-200 group-hover:ring-[#1a73e8] transition-all flex items-center justify-center text-white font-semibold text-xs shadow-xs">
                  {currentUser.profile_image ? (
                    <Image
                      src={currentUser.profile_image}
                      alt={currentUser.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.name.charAt(0)}</span>
                  )}
                  {/* Online indicator */}
                  {/*<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />*/}
                </div>

                <div className="hidden lg:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-32.5">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-32.5">
                    {currentUser.role || currentUser.email || "ผู้ใช้งาน"}
                  </span>
                </div>

                <ChevronDown
                  className={`hidden lg:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180 text-[#1a73e8]" : ""
                    }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-linear-to-tr from-blue-500 to-indigo-600 shrink-0 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-100">
                      {currentUser.profile_image ? (
                        <Image
                          src={currentUser.profile_image}
                          alt={currentUser.name}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{currentUser.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {currentUser.name}
                      </div>
                      {currentUser.email && (
                        <div className="text-xs text-slate-500 truncate">
                          {currentUser.email}
                        </div>
                      )}
                      {currentUser.role && (
                        <div className="inline-block text-[10px] font-medium text-[#1a73e8] bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                          {currentUser.role}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="px-2 py-1.5 space-y-0.5">
                    {/* เมนูแก้ไขข้อมูล */}
                    <Link
                      href="/u/profile"
                      className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>แก้ไขข้อมูล</span>
                    </Link>

                    {/* เมนูดูรายการที่เคยจองห้องประชุม */}
                    <Link
                      href="/u/bookings"
                      className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                      <span>ดูรายการที่เคยจองห้องประชุม</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 my-1" />

                  {/* เมนูออกจากระบบ */}
                  <div className="px-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not Logged-in: Sign In Button */
            <Link href="/u/signin">
              <Button
                variant="primary"
                size="sm"
                text="เข้าสู่ระบบ"
                icon={<LogIn className="w-4 h-4" />}
              />
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE NAVIGATION DRAWER (Slide Down with Accordions) */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile User Summary if logged in */}
          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-tr from-blue-500 to-indigo-600 shrink-0 flex items-center justify-center text-white font-semibold text-xs">
                {currentUser.profile_image ? (
                  <Image
                    src={currentUser.profile_image}
                    alt={currentUser.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser.role || currentUser.email}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Items */}
          <div className="space-y-1">
            {menus.map((item, mIdx) => {
              const hasSub = Boolean(item.submenu && item.submenu.length > 0);
              const topAccordionKey = `mobile-top-${mIdx}`;
              const isTopOpen = Boolean(openAccordions[topAccordionKey]);

              if (!hasSub) {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.menu_title}
                    href={item.href || "#"}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                        ? "bg-blue-50 text-[#1a73e8] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.menu_title}</span>
                  </Link>
                );
              }

              return (
                <div
                  key={item.menu_title}
                  className="rounded-xl border border-slate-100 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(topAccordionKey)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50/60 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.menu_title}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isTopOpen ? "rotate-180 text-[#1a73e8]" : ""
                        }`}
                    />
                  </button>

                  {isTopOpen && (
                    <div className="p-2 space-y-1 bg-white">
                      {item.submenu?.map((sub, sIdx) => {
                        const hasNested = Boolean(
                          sub.submenu && sub.submenu.length > 0
                        );
                        const subKey = `mobile-sub-${mIdx}-${sIdx}`;
                        const isSubOpen = Boolean(openAccordions[subKey]);

                        if (hasNested) {
                          return (
                            <div
                              key={sub.title}
                              className="rounded-lg bg-slate-50/50 overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() => toggleAccordion(subKey)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {sub.icon && <span>{sub.icon}</span>}
                                  <span>{sub.title}</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSubOpen ? "rotate-180 text-[#1a73e8]" : ""
                                    }`}
                                />
                              </button>

                              {isSubOpen && (
                                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-blue-200 ml-4 mb-1">
                                  {sub.submenu?.map((nested) => (
                                    <Link
                                      key={nested.title}
                                      href={nested.href || "#"}
                                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md hover:bg-white"
                                    >
                                      {nested.icon && (
                                        <span>{nested.icon}</span>
                                      )}
                                      <span>{nested.title}</span>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={sub.title}
                            href={sub.href || "#"}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                          >
                            {sub.icon && <span>{sub.icon}</span>}
                            <span>{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile User Action Links if logged in */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-200 space-y-1">
              <Link
                href="/u/profile"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>แก้ไขข้อมูล</span>
              </Link>
              <Link
                href="/u/bookings"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <CalendarDays className="w-4 h-4 text-slate-500" />
                <span>ดูรายการที่เคยจองห้องประชุม</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default NavBar;
