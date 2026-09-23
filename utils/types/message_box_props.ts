import React from "react";

export type MessageBoxVariant = "success" | "error" | "warning" | "info";

export interface MessageBoxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  text?: React.ReactNode;
  variant?: MessageBoxVariant;
  showIcon?: boolean;
  icon?: React.ReactNode | boolean;
  iconAnimation?: string;
  showSpinner?: boolean;
  spinner?: boolean;
  extra?: React.ReactNode;
}
