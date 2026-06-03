"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;

  variant?: "primary" | "danger" | "secondary";
}

export default function Button({
  children,
  loading,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const baseStyle =
    "w-full rounded-lg px-4 py-3 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(baseStyle, variantStyles[variant], className)}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
