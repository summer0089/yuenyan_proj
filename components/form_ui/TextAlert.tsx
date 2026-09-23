import React from "react";
import {
  TextAlertProps,
  TextAlertVariant,
} from "@/utils/types/text_alert_props";
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const variantStyles: Record<
  TextAlertVariant,
  { container: string; iconColor: string }
> = {
  error: {
    container: "bg-red-50 border-red-200 text-red-700",
    iconColor: "text-red-500",
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    iconColor: "text-amber-500",
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-800",
    iconColor: "text-emerald-500",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    iconColor: "text-blue-500",
  },
};

const defaultIcons: Record<TextAlertVariant, React.ReactNode> = {
  error: <AlertTriangle className="w-4 h-4 shrink-0" />,
  warning: <AlertCircle className="w-4 h-4 shrink-0" />,
  success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  info: <Info className="w-4 h-4 shrink-0" />,
};

export const TextAlert: React.FC<TextAlertProps> = ({
  text,
  variant = "error",
  icon = true,
  title,
  onClose,
  children,
  className = "",
  ...rest
}) => {
  const content = text ?? children;
  if (!content && !title) return null;

  const { container, iconColor } = variantStyles[variant];

  // Resolve icon element
  let renderedIcon: React.ReactNode = null;
  if (icon === true || icon === undefined) {
    renderedIcon = (
      <span className={`${iconColor} shrink-0`}>
        {defaultIcons[variant]}
      </span>
    );
  } else if (icon) {
    renderedIcon = <span className="shrink-0">{icon}</span>;
  }

  return (
    <div
      role="alert"
      className={`p-3.5 border text-sm rounded-lg flex items-start gap-2.5 transition-all ${container} ${className}`}
      {...rest}
    >
      {renderedIcon && <div className="mt-0.5">{renderedIcon}</div>}

      <div className="flex-1">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        {content && <span>{content}</span>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 ml-2 -mr-1 -mt-1 p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/5 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

TextAlert.displayName = "TextAlert";

export default TextAlert;
