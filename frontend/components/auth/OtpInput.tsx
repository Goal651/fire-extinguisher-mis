"use client";

import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function OtpInput({ value, onChange }: Props) {
  const refs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;

    const digits = value.split("").concat(Array(6).fill(""));

    digits[index] = val;

    const newValue = digits.slice(0, 6).join("");

    onChange(newValue);

    if (val && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) refs.current[index] = el;
          }}
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          className="w-12 h-12 text-center rounded-lg text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#D2D2D2",
            color: "#2F2F2F",
            borderWidth: "1px",
          }}
        />
      ))}
    </div>
  );
}
