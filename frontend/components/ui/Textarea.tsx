"use client";

import React, { forwardRef } from "react";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium" style={{ color: "#2F2F2F" }}>
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          {...props}
          rows={4}
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
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
