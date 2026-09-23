import React from "react";

export interface PasswordBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  showTogglePassword?: boolean;
}
