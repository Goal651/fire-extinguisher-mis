"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, className, ...props }, ref) => {
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

        <textarea
          ref={ref}
          rows={4}
          {...props}
          className={clsx(
            "w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-150 resize-y",
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

Textarea.displayName = "Textarea";
export default Textarea;
