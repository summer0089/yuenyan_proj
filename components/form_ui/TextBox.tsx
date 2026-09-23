import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import { TextBoxProps } from "@/utils/types/textbox_props";

export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      type = "text",
      placeholder,
      value,
      onChange,
      disabled,
      className = "",
      containerClassName = "",
      ...rest
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg border text-slate-900 placeholder-slate-400 bg-white focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${error
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-300 focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] hover:border-slate-400"
            } ${className}`}
          {...rest}
        />

        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium animate-fade-in"
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

TextBox.displayName = "TextBox";

export default TextBox;
