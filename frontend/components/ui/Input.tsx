"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export default function Input({ error, label, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium" style={{ color: "#2F2F2F" }}>
          {label}
        </label>
      )}

      <input
        {...props}
        className="
          w-full
          rounded-lg
          border
          px-4
          py-3
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          transition
        "
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: error ? "#E91E63" : "#D2D2D2",
          color: "#2F2F2F",
        }}
      />

      {error && (
        <p className="text-sm" style={{ color: "#E91E63" }}>
          {error}
        </p>
      )}
    </div>
  );
}
