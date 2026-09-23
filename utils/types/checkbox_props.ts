import React from "react";

export interface CheckBoxOption {
  label: React.ReactNode;
  value: string;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface CheckBoxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
}

export interface CheckBoxGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  helperText?: string;
  options?: CheckBoxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (selectedValues: string[]) => void;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
}
