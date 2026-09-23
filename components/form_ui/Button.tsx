import React, { forwardRef } from "react";
import {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from "@/utils/types/button_props";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0f4494] focus:ring-[#1a73e8] shadow-sm",
  secondary:
    "text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400",
  outline:
    "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:ring-[#1a73e8]",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400",
  danger:
    "text-white bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-3 text-xs rounded-md gap-1.5",
  md: "py-3 px-4 text-sm rounded-lg gap-2",
  lg: "py-3.5 px-6 text-base rounded-xl gap-2.5",
};

const spinnerSizeStyles: Record<ButtonSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-6 h-6 border-[2.5px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      text,
      icon,
      iconPosition = "left",
      loading = false,
      loadingText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const content = text ?? children;
    const effectiveLeftIcon =
      leftIcon || (iconPosition === "left" ? icon : undefined);
    const effectiveRightIcon =
      rightIcon || (iconPosition === "right" ? icon : undefined);

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`font-semibold inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 select-none enabled:cursor-pointer disabled:cursor-not-allowed ${
          fullWidth ? "w-full" : ""
        } ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...rest}
      >
        {loading ? (
          <>
            <div
              className={`${spinnerSizeStyles[size]} border-current border-t-transparent rounded-full animate-spin shrink-0`}
            />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {effectiveLeftIcon && (
              <span className="shrink-0">{effectiveLeftIcon}</span>
            )}
            {content && <span>{content}</span>}
            {effectiveRightIcon && (
              <span className="shrink-0">{effectiveRightIcon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
