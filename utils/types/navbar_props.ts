import React from "react";

export interface UserProfile {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  position?: string;
  department?: string;
  phoneNumber?: string;
  profile_image?: string | null;
}

export interface SubMenuItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
  roles?: string[]; // กำหนด role ที่สามารถมองเห็นเมนูนี้ได้ (ถ้าไม่กำหนด = ทุกคนมองเห็นได้)
  submenu?: SubMenuItem[]; // Submenu level 2 (rendered as Accordion if present)
}

export interface NavMenuItem {
  menu_title: string; // หัวข้อใหญ่
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  roles?: string[]; // กำหนด role ที่สามารถมองเห็นเมนูนี้ได้ (ถ้าไม่กำหนด = ทุกคนมองเห็นได้)
  submenu?: SubMenuItem[]; // หัวข้อย่อย (Submenu level 1)
}

export interface NavBarProps {
  logoSrc?: string;
  logoHref?: string;
  logoAlt?: string;
  title?: string;
  badge?: string;
  menus?: NavMenuItem[];
  user?: UserProfile | null;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  hiddenPaths?: string[];
  hidden?: boolean;
  className?: string;
}
