"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { admin, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const displayName =
    admin?.name ||
    `${admin?.firstName ?? ""} ${admin?.lastName ?? ""}`.trim() ||
    admin?.email ||
    "";

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3 border-b sticky top-0 z-20"
      style={{ backgroundColor: "#ffffff", borderColor: "#d2d2d2" }}
    >
      <div />

      <div className="flex items-center gap-3">
        {admin && (
          <div className="hidden sm:flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: "#f4f4f4",
                color: "#2f2f2f",
                border: "1px solid #e0e0e0",
              }}
            >
              {displayName[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium truncate max-w-[160px]" style={{ color: "#2f2f2f" }}>
                {displayName}
              </p>
              <p className="text-[11px] capitalize" style={{ color: "#999" }}>{admin.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-red-50"
          style={{ color: "#d32f2f", border: "1px solid #ffd0d0" }}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
