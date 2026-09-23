"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { PasswordBoxProps } from "@/utils/types/passwordbox_props";

export const PasswordBox = forwardRef<HTMLInputElement, PasswordBoxProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      placeholder,
      value,
      onChange,
      disabled,
      className = "",
      containerClassName = "",
      showTogglePassword = true,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-slate-700"
            >
              {label}
            </label>
          </div>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-3 ${showTogglePassword ? "pr-11" : "pr-4"
              } rounded-lg border text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${error
                ? "border-danger focus:ring-1 focus:ring-danger"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary hover:border-slate-400"
              } ${className}`}
            {...rest}
          />

          {showTogglePassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="mt-1.5 text-xs text-danger flex items-center gap-1 font-medium animate-fade-in"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

PasswordBox.displayName = "PasswordBox";

export default PasswordBox;
