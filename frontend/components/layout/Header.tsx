"use client";

import { useRouter } from "next/navigation";

import { clearToken } from "@/lib/auth";

export default function Header() {
  const router = useRouter();

  const logout = () => {
    clearToken();

    router.push("/login");
  };

  return (
    <header
      className="flex justify-between items-center p-5 border-b"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#D2D2D2",
      }}
    >
      <h2 className="font-semibold" style={{ color: "#2F2F2F" }}>
        Fire Extinguisher Management
      </h2>

      <button
        onClick={logout}
        className="px-4 py-2 rounded-lg transition hover:bg-red-700"
        style={{
          backgroundColor: "#D32F2F",
          color: "#FFFFFF",
        }}
      >
        Logout
      </button>
    </header>
  );
}
