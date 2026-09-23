import React, { forwardRef } from "react";
import {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from "@/utils/types/button_props";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-primary-foreground bg-primary hover:bg-primary-hover active:bg-primary-active focus:ring-primary shadow-sm",
  secondary:
    "text-slate-800 bg-secondary hover:bg-secondary-hover active:bg-secondary-active border border-secondary-border focus:ring-primary shadow-2xs",
  outline:
    "border border-slate-300 bg-transparent text-slate-700 hover:bg-primary-light/60 hover:text-primary active:bg-primary-light focus:ring-primary",
  ghost:
    "bg-transparent text-slate-700 hover:bg-primary-light/50 hover:text-primary active:bg-primary-light/80 focus:ring-primary",
  danger:
    "text-danger-foreground bg-danger hover:bg-danger-hover active:bg-danger-active focus:ring-danger shadow-sm",
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
