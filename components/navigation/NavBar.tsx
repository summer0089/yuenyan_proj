"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  NavBarProps,
  NavMenuItem,
  SubMenuItem,
  UserProfile,
} from "@/utils/types/navbar_props";
import { Button } from "@/components/form_controls/Button";
import {
  ChevronDown,
  User,
  KeyRound,
  LogOut,
  LogIn,
  Menu,
  X,
} from "lucide-react";

// Default Menu Configuration
export const DEFAULT_MENUS: NavMenuItem[] = [];

// Palette of attractive modern background colors/gradients for avatars without images
const AVATAR_BG_PALETTE = [
  "bg-linear-to-tr from-blue-600 to-indigo-600",
  "bg-linear-to-tr from-emerald-600 to-teal-600",
  "bg-linear-to-tr from-violet-600 to-purple-600",
  "bg-linear-to-tr from-rose-500 to-pink-600",
  "bg-linear-to-tr from-amber-500 to-orange-600",
  "bg-linear-to-tr from-cyan-600 to-blue-600",
  "bg-linear-to-tr from-teal-600 to-emerald-600",
  "bg-linear-to-tr from-fuchsia-600 to-indigo-600",
];

// Returns deterministic avatar background color based on name/identifier
function getAvatarBgColor(text?: string): string {
  if (!text) return AVATAR_BG_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_BG_PALETTE.length;
  return AVATAR_BG_PALETTE[index];
}

// Extracts the first character/consonant of the user's name
function getInitialChar(name?: string, firstName?: string): string {
  const target = (firstName || name || "").trim();
  if (!target) return "U";
  return target.charAt(0).toUpperCase();
}

// UserAvatar Component: renders image if available, else colored background with initial consonant
function UserAvatar({
  user,
  size = 36,
  className = "",
  textSize = "text-xs",
}: {
  user: UserProfile;
  size?: number;
  className?: string;
  textSize?: string;
}) {
  const { name = "", firstName = "", profile_image = null } = user || {};
  const cleanImage = profile_image ? profile_image.split(/[?#]/)[0] : null;
  const hasImage = Boolean(cleanImage && cleanImage.trim().length > 0);
  const initial = getInitialChar(name, firstName);
  const bgColor = getAvatarBgColor(name || firstName || "user");

  if (hasImage && cleanImage) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={cleanImage}
          alt={name || "User Avatar"}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold select-none shadow-xs ${bgColor} ${textSize} ${className}`}
      style={{ width: size, height: size }}
      title={name}
    >
      <span>{initial}</span>
    </div>
  );
}

/**
 * ตรวจสอบว่า userRole มีสิทธิ์เข้าถึงตาม roles ที่กำหนดหรือไม่
 * - ถ้า roles ไม่ได้กำหนด หรือเป็นอาร์เรย์ว่าง -> เข้าถึงได้ทุกคน
 * - ถ้า roles มีการกำหนด -> ต้องมี userRole ที่ตรงกับบทบาทใดบทบาทหนึ่ง (ไม่สนใจตัวพิมพ์เล็ก-ใหญ่)
 */
function isRoleAllowed(allowedRoles?: string[], userRole?: string): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (!userRole) {
    return false;
  }
  const normalizedUserRole = userRole.trim().toLowerCase();
  return allowedRoles.some(
    (role) => role.trim().toLowerCase() === normalizedUserRole
  );
}

/**
 * กรองเมนูและเมนูย่อยตามบทบาทของผู้ใช้งาน (Role-based Filtering)
 */
function filterMenusByRole(
  menus: NavMenuItem[],
  userRole?: string
): NavMenuItem[] {
  return menus
    .filter((menu) => isRoleAllowed(menu.roles, userRole))
    .map((menu) => {
      if (!menu.submenu || menu.submenu.length === 0) {
        return menu;
      }

      // กรอง Submenu ระดับ 1
      const filteredSubmenu = menu.submenu
        .filter((sub) => isRoleAllowed(sub.roles, userRole))
        .map((sub) => {
          if (!sub.submenu || sub.submenu.length === 0) {
            return sub;
          }

          // กรอง Submenu ระดับ 2 (Nested)
          const filteredNested = sub.submenu.filter((nested) =>
            isRoleAllowed(nested.roles, userRole)
          );

          return {
            ...sub,
            submenu: filteredNested,
          };
        })
        .filter((sub) => {
          const hasSubLink = Boolean(sub.href && sub.href !== "#");
          // ถ้าไม่มีลิงก์ และไม่มีเมนูย่อยเหลืออยู่ ให้ซ่อน
          if (!hasSubLink && (!sub.submenu || sub.submenu.length === 0)) {
            return false;
          }
          return true;
        });

      return {
        ...menu,
        submenu: filteredSubmenu,
      };
    })
    .filter((menu) => {
      const hasLink = Boolean(menu.href && menu.href !== "#");
      // ถ้าไม่มีลิงก์ และไม่มีเมนูย่อยเหลืออยู่ ให้ซ่อน
      if (!hasLink && (!menu.submenu || menu.submenu.length === 0)) {
        return false;
      }
      return true;
    });
}

export function NavBar({
  logoSrc = "/favicon.ico",
  logoHref = "/",
  logoAlt = "Yuenyan Logo",
  title = "Yuenyan : ยืนยัน",
  badge = "ระบบยืนยันตนรวมศูนย์",
  menus = DEFAULT_MENUS,
  user: initialUser,
  isLoggedIn: initialIsLoggedIn,
  onLogout,
  hiddenPaths = ["/u/signin", "/u/signup", "/u/forgot-password"],
  hidden = false,
  className = "",
}: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

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

  // User state: respect initialUser if provided, otherwise fetch active session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    initialUser !== undefined
      ? initialUser
      : initialIsLoggedIn === false
        ? null
        : null
  );

  // Safe navigation menus array filtered by user role
  const navMenus = useMemo(() => {
    const rawMenus = Array.isArray(menus) ? menus : (DEFAULT_MENUS ?? []);
    return filterMenusByRole(rawMenus, currentUser?.role);
  }, [menus, currentUser?.role]);

  // Load session from /api/user/session and listen to auth changes
  useEffect(() => {
    if (initialUser !== undefined) {
      return;
    }

    let isMounted = true;

    async function loadSession() {
      try {
        const res = await fetch("/api/user/session");
        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.user) {
          setCurrentUser({
            id: data.user.id,
            name:
              data.user.name ||
              `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() ||
              "ผู้ใช้งาน",
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            role: data.user.role,
            position: data.user.position,
            department: data.user.department,
            phoneNumber: data.user.phoneNumber,
            profile_image: data.user.image_url || null,
          });
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("NavBar: Failed to fetch session:", err);
        if (isMounted) setCurrentUser(null);
      }
    }

    loadSession();

    const handleAuthChange = () => {
      loadSession();
    };

    window.addEventListener("auth-state-changed", handleAuthChange);
    return () => {
      isMounted = false;
      window.removeEventListener("auth-state-changed", handleAuthChange);
    };
  }, [initialUser]);

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
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await fetch("/api/user/signout", { method: "POST" });
      } catch (err) {
        console.error("Logout error:", err);
      }
      setCurrentUser(null);
      setIsUserMenuOpen(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth-state-changed", { detail: null })
        );
      }
      router.push("/u/signin");
      router.refresh();
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
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-800 tracking-tight group-hover:text-primary transition-colors leading-tight">
                {title}
              </span>
            </div>
          </Link>

          {badge && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-300 font-light">|</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary border border-primary-border">
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CENTER / DESKTOP NAVIGATION MENU (Destructured menu props) */}
        {/* ========================================================================= */}
        <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-start ml-6">
          {navMenus.map((menuItem: NavMenuItem, menuIdx: number) => {
            const {
              menu_title,
              href = "#",
              icon,
              badge: menuBadge,
              submenu = [],
            } = menuItem;
            const hasSubmenu = Boolean(submenu && submenu.length > 0);
            const isOpen = activeMenuIndex === menuIdx;

            if (!hasSubmenu) {
              const isActive = pathname === href;
              return (
                <Link
                  key={`desktop-m-${menu_title || "item"}-${menuIdx}`}
                  href={href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "text-primary bg-primary-light font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                >
                  {icon && <span>{icon}</span>}
                  <span>{menu_title}</span>
                  {menuBadge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                      {menuBadge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <div
                key={`desktop-m-${menu_title || "item"}-${menuIdx}`}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuIndex(isOpen ? null : menuIdx)
                  }
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isOpen
                    ? "text-primary bg-primary-light"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  aria-expanded={isOpen}
                >
                  {icon && <span>{icon}</span>}
                  <span>{menu_title}</span>
                  {menuBadge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                      {menuBadge}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : "text-slate-400"
                      }`}
                  />
                </button>

                {/* Desktop Dropdown Menu Panel */}
                {isOpen && (
                  <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 pb-2 mb-1 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {menu_title}
                    </div>

                    <div className="space-y-1 px-1.5">
                      {submenu.map((subItem: SubMenuItem, subIdx: number) => {
                        const {
                          title,
                          href: subHref = "#",
                          icon: subIcon,
                          badge: subBadge,
                          description,
                          submenu: nestedSubmenu = [],
                        } = subItem;
                        const hasNestedSub = Boolean(
                          nestedSubmenu && nestedSubmenu.length > 0
                        );
                        const accordionKey = `${menuIdx}-${subIdx}`;
                        const isAccordionOpen = Boolean(
                          openAccordions[accordionKey]
                        );

                        // If Submenu has nested items -> Render as ACCORDION
                        if (hasNestedSub) {
                          return (
                            <div
                              key={`desktop-sub-${title || "sub"}-${subIdx}`}
                              className="rounded-xl overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() => toggleAccordion(accordionKey)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${isAccordionOpen
                                  ? "bg-primary-light text-primary"
                                  : "text-slate-700 hover:bg-slate-50"
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {subIcon && <span>{subIcon}</span>}
                                  <span>{title || "เมนูย่อย"}</span>
                                  {subBadge && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                      {subBadge}
                                    </span>
                                  )}
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isAccordionOpen
                                    ? "rotate-180 text-primary"
                                    : "text-slate-400"
                                    }`}
                                />
                              </button>

                              {/* Nested Accordion Content */}
                              {isAccordionOpen && (
                                <div className="pl-6 pr-2 py-1 space-y-0.5 border-l-2 border-primary-border ml-4 mt-1 mb-1">
                                  {nestedSubmenu.map(
                                    (
                                      nestedItem: SubMenuItem,
                                      nestedIdx: number
                                    ) => {
                                      const {
                                        title: nestedTitle,
                                        href: nestedHref = "#",
                                        icon: nestedIcon,
                                        badge: nestedBadge,
                                      } = nestedItem;
                                      const isNestedActive =
                                        pathname === nestedHref;
                                      return (
                                        <Link
                                          key={`desktop-nested-${nestedTitle || "nested"}-${nestedIdx}`}
                                          href={nestedHref}
                                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${isNestedActive
                                            ? "font-semibold text-primary bg-primary-light"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                            }`}
                                        >
                                          {nestedIcon && (
                                            <span>{nestedIcon}</span>
                                          )}
                                          <span>{nestedTitle || "รายการ"}</span>
                                          {nestedBadge && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                              {nestedBadge}
                                            </span>
                                          )}
                                        </Link>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular Submenu item (No nested items)
                        const isSubActive = pathname === subHref;
                        return (
                          <Link
                            key={`desktop-sub-${title || "sub"}-${subIdx}`}
                            href={subHref}
                            className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${isSubActive
                              ? "bg-primary-light text-primary font-semibold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                          >
                            {subIcon && (
                              <div className="mt-0.5 shrink-0">{subIcon}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium leading-tight">
                                  {title || "รายการ"}
                                </span>
                                {subBadge && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                    {subBadge}
                                  </span>
                                )}
                              </div>
                              {description && (
                                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                  {description}
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
            (() => {
              const {
                name: currentUserName = "",
                email: currentUserEmail = "",
                department: currentUserDepartment = "",
                position: currentUserPosition = "",
                role: currentUserRole = "",
              } = currentUser;

              const displayRole =
                currentUserRole === "admin" || currentUserRole === "superadmin"
                  ? "ผู้ดูแลระบบ"
                  : currentUserRole === "user"
                    ? "ผู้ใช้งานทั่วไป"
                    : currentUserRole;

              const displaySubtext =
                currentUserDepartment ||
                currentUserPosition ||
                displayRole ||
                currentUserEmail ||
                "ผู้ใช้งาน";

              return (
                /* Logged-in User Avatar & Panel */
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="User profile menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <UserAvatar
                      user={currentUser}
                      size={36}
                      textSize="text-xs"
                      className="ring-2 ring-slate-200 group-hover:ring-primary transition-all shadow-xs"
                    />

                    <div className="hidden lg:flex flex-col text-left leading-tight pr-1">
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-36">
                        {currentUserName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-36">
                        {displaySubtext}
                      </span>
                    </div>

                    <ChevronDown
                      className={`hidden lg:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180 text-primary" : ""
                        }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Profile Header */}
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <UserAvatar
                          user={currentUser}
                          size={44}
                          textSize="text-base"
                          className="ring-2 ring-primary-border shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">
                            {currentUserName}
                          </div>
                          {currentUserEmail && (
                            <div className="text-xs text-slate-500 truncate">
                              {currentUserEmail}
                            </div>
                          )}
                          {(currentUserDepartment || currentUserPosition) && (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {currentUserPosition}
                              {currentUserPosition && currentUserDepartment
                                ? " • "
                                : ""}
                              {currentUserDepartment}
                            </div>
                          )}
                          {displayRole && (
                            <div className="inline-block text-[10px] font-medium text-primary bg-primary-light px-1.5 py-0.5 rounded mt-1">
                              {displayRole}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="px-2 py-1.5 space-y-0.5">
                        <Link
                          href="/u/profile"
                          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>แก้ไขข้อมูลส่วนตัว</span>
                        </Link>

                        <Link
                          href="/u/change-password"
                          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <KeyRound className="w-4 h-4 text-slate-500" />
                          <span>เปลี่ยนรหัสผ่าน</span>
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
              );
            })()
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
      {/* MOBILE NAVIGATION DRAWER (Destructured menu props) */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile User Summary if logged in */}
          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
              <UserAvatar
                user={currentUser}
                size={40}
                textSize="text-sm"
                className="ring-1 ring-slate-200 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser.department ||
                    currentUser.position ||
                    currentUser.role ||
                    currentUser.email}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Items */}
          <div className="space-y-1">
            {navMenus.map((menuItem: NavMenuItem, mIdx: number) => {
              const {
                menu_title,
                href = "#",
                icon,
                badge: menuBadge,
                submenu = [],
              } = menuItem;
              const hasSub = Boolean(submenu && submenu.length > 0);
              const topAccordionKey = `mobile-top-${mIdx}`;
              const isTopOpen = Boolean(openAccordions[topAccordionKey]);

              if (!hasSub) {
                const isActive = pathname === href;
                return (
                  <Link
                    key={`mobile-m-${menu_title || "item"}-${mIdx}`}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {icon && <span>{icon}</span>}
                    <span>{menu_title}</span>
                    {menuBadge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                        {menuBadge}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <div
                  key={`mobile-m-${menu_title || "item"}-${mIdx}`}
                  className="rounded-xl border border-slate-100 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(topAccordionKey)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50/60 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {icon && <span>{icon}</span>}
                      <span>{menu_title}</span>
                      {menuBadge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                          {menuBadge}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isTopOpen ? "rotate-180 text-primary" : ""
                        }`}
                    />
                  </button>

                  {isTopOpen && (
                    <div className="p-2 space-y-1 bg-white">
                      {submenu.map((subItem: SubMenuItem, sIdx: number) => {
                        const {
                          title,
                          href: subHref = "#",
                          icon: subIcon,
                          badge: subBadge,
                          submenu: nestedSubmenu = [],
                        } = subItem;
                        const hasNested = Boolean(
                          nestedSubmenu && nestedSubmenu.length > 0
                        );
                        const subKey = `mobile-sub-${mIdx}-${sIdx}`;
                        const isSubOpen = Boolean(openAccordions[subKey]);

                        if (hasNested) {
                          return (
                            <div
                              key={`mobile-sub-${title || "sub"}-${sIdx}`}
                              className="rounded-lg bg-slate-50/50 overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() => toggleAccordion(subKey)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {subIcon && <span>{subIcon}</span>}
                                  <span>{title || "เมนูย่อย"}</span>
                                  {subBadge && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                      {subBadge}
                                    </span>
                                  )}
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSubOpen ? "rotate-180 text-primary" : ""
                                    }`}
                                />
                              </button>

                              {isSubOpen && (
                                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-primary-border ml-4 mb-1">
                                  {nestedSubmenu.map((nestedItem: SubMenuItem, nIdx: number) => {
                                    const {
                                      title: nestedTitle,
                                      href: nestedHref = "#",
                                      icon: nestedIcon,
                                      badge: nestedBadge,
                                    } = nestedItem;
                                    const isNestedActive =
                                      pathname === nestedHref;
                                    return (
                                      <Link
                                        key={`mobile-nested-${nestedTitle || "nested"}-${nIdx}`}
                                        href={nestedHref}
                                        className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors ${isNestedActive
                                          ? "font-semibold text-primary bg-primary-light"
                                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                          }`}
                                      >
                                        {nestedIcon && (
                                          <span>{nestedIcon}</span>
                                        )}
                                        <span>{nestedTitle || "รายการ"}</span>
                                        {nestedBadge && (
                                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                            {nestedBadge}
                                          </span>
                                        )}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        const isSubActive = pathname === subHref;
                        return (
                          <Link
                            key={`mobile-sub-${title || "sub"}-${sIdx}`}
                            href={subHref}
                            className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${isSubActive
                              ? "font-semibold text-primary bg-primary-light"
                              : "text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {subIcon && <span>{subIcon}</span>}
                              <span>{title || "รายการ"}</span>
                            </div>
                            {subBadge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                {subBadge}
                              </span>
                            )}
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
                <span>แก้ไขข้อมูลส่วนตัว</span>
              </Link>
              <Link
                href="/u/change-password"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>เปลี่ยนรหัสผ่าน</span>
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
