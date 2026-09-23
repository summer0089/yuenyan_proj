import React from "react";

export interface UserProfile {
  name: string;
  email?: string;
  role?: string;
  profile_image?: string;
}

export interface SubMenuItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
  submenu?: SubMenuItem[]; // Submenu level 2 (rendered as Accordion if present)
}

export interface NavMenuItem {
  menu_title: string; // หัวข้อใหญ่
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
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
