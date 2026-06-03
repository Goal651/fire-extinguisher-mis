"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "danger" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  loading,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 whitespace-nowrap";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-[#2f2f2f] hover:bg-[#1a1a1a] active:bg-[#111] text-white focus:ring-[#2f2f2f]/30",
    danger:
      "bg-[#d32f2f] hover:bg-[#b71c1c] active:bg-[#9a1616] text-white focus:ring-[#d32f2f]/30",
    secondary:
      "bg-white hover:bg-[#f8f8f8] active:bg-[#f0f0f0] text-[#2f2f2f] border border-[#d2d2d2] focus:ring-[#2f2f2f]/20",
    ghost:
      "bg-transparent hover:bg-[#f8f8f8] active:bg-[#f0f0f0] text-[#666666] hover:text-[#2f2f2f] focus:ring-[#2f2f2f]/20",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(base, sizes[size], variants[variant], className)}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
