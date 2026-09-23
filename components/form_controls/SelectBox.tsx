import React, { forwardRef } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { SelectBoxProps } from "@/utils/types/selectbox_props";

export const SelectBox = forwardRef<HTMLSelectElement, SelectBoxProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      value,
      onChange,
      disabled,
      className = "",
      containerClassName = "",
      options,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-3 pr-10 rounded-lg border text-slate-900 bg-white focus:outline-none transition-colors appearance-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
              error
                ? "border-danger focus:ring-1 focus:ring-danger"
                : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary hover:border-slate-400"
            } ${!value ? "text-slate-400" : "text-slate-900"} ${className}`}
            {...rest}
          >
            <option value="" disabled hidden={Boolean(value)}>
              {placeholder || "เลือกข้อมูล..."}
            </option>
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="text-slate-900"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {error && (
          <p
            id={selectId ? `${selectId}-error` : undefined}
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

SelectBox.displayName = "SelectBox";

export default SelectBox;
