"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            className="block text-sm font-medium"
            style={{ color: "#2f2f2f" }}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          {...props}
          className={clsx(
            "w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-150",
            "placeholder:text-[#c5c5c5]",
            "focus:outline-none focus:ring-2",
            error
              ? "border-[#e91e63] focus:ring-[#e91e63]/20"
              : "border-[#d2d2d2] focus:border-[#2f2f2f] focus:ring-[#2f2f2f]/10",
            "bg-white text-[#2f2f2f]",
            className,
          )}
        />

        {hint && !error && (
          <p className="text-xs" style={{ color: "#999" }}>
            {hint}
          </p>
        )}

        {error && (
          <p className="text-xs flex items-center gap-1" style={{ color: "#e91e63" }}>
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
