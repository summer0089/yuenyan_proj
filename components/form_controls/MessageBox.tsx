import React from "react";
import {
  MessageBoxProps,
  MessageBoxVariant,
} from "@/utils/types/message_box_props";
import { Check, X, AlertTriangle, Info } from "lucide-react";

const variantConfig: Record<
  MessageBoxVariant,
  { containerBg: string; textColor: string; icon: React.ReactNode }
> = {
  success: {
    containerBg: "bg-emerald-100",
    textColor: "text-emerald-600",
    icon: <Check className="w-8 h-8" strokeWidth={3} />,
  },
  error: {
    containerBg: "bg-red-100",
    textColor: "text-red-600",
    icon: <X className="w-8 h-8" strokeWidth={2.5} />,
  },
  warning: {
    containerBg: "bg-amber-100",
    textColor: "text-amber-600",
    icon: <AlertTriangle className="w-8 h-8" strokeWidth={2} />,
  },
  info: {
    containerBg: "bg-blue-100",
    textColor: "text-blue-600",
    icon: <Info className="w-8 h-8" strokeWidth={2} />,
  },
};

export const MessageBox: React.FC<MessageBoxProps> = ({
  title,
  text,
  variant = "success",
  showIcon = true,
  icon,
  iconAnimation = "animate-bounce",
  showSpinner = true,
  spinner,
  extra,
  children,
  className = "",
  ...rest
}) => {
  const content = text ?? children;
  const config = variantConfig[variant];

  // Determine whether to display the icon
  const isIconVisible =
    showIcon && icon !== false;

  // Determine which icon element to display
  let renderedIcon: React.ReactNode = null;
  if (isIconVisible) {
    if (React.isValidElement(icon)) {
      renderedIcon = icon;
    } else {
      renderedIcon = config.icon;
    }
  }

  // Determine whether to display the spinner
  const isSpinnerVisible = spinner !== undefined ? spinner : showSpinner;

  return (
    <div className={`text-center py-10 animate-fade-in ${className}`} {...rest}>
      {/* Animation Icon */}
      {isIconVisible && (
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.containerBg} ${config.textColor} mb-6 ${iconAnimation}`}
        >
          {renderedIcon}
        </div>
      )}

      {/* Title */}
      {title && (
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      )}

      {/* Text / Description */}
      {content && <p className="text-slate-600 mb-6">{content}</p>}

      {/* Spinner */}
      {isSpinnerVisible && (
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto" />
      )}

      {/* Extra custom content */}
      {extra && <div className="mt-6">{extra}</div>}
    </div>
  );
};

MessageBox.displayName = "MessageBox";

export default MessageBox;
