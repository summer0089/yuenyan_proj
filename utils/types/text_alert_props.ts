import React from "react";

export type TextAlertVariant = "error" | "warning" | "success" | "info";

export interface TextAlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  text?: React.ReactNode;
  variant?: TextAlertVariant;
  icon?: React.ReactNode | boolean;
  title?: React.ReactNode;
  onClose?: () => void;
}
