import React from "react";

export interface FooterProps {
  organizationName?: string;
  copyrightYear?: number;
  text?: React.ReactNode;
  hiddenPaths?: string[];
  hidden?: boolean;
  className?: string;
}
