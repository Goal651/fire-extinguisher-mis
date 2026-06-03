"use client";

import { useEffect } from "react";
import Button from "./Button";

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
}

export default function Modal({
  open,
  title,
  message,
  onConfirm,
  onClose,
  confirmLabel = "Delete",
  confirmVariant = "danger",
}: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4"
        style={{ backgroundColor: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: "#ffeaea" }}
        >
          🗑
        </div>

        <div>
          <h2 className="text-base font-bold" style={{ color: "#2f2f2f" }}>
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "#666666" }}>
            {message}
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={confirmVariant} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
