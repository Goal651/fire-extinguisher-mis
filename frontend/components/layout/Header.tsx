"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { admin, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header
      className="flex justify-between items-center px-6 py-4 border-b"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#D2D2D2",
      }}
    >
      <h2 className="font-semibold" style={{ color: "#2F2F2F" }}>
        Fire Extinguisher Management
      </h2>

      <div className="flex items-center gap-4">
        {admin && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium" style={{ color: "#2F2F2F" }}>
              {admin.name || `${admin.firstName ?? ""} ${admin.lastName ?? ""}`.trim() || admin.email}
            </p>
            <p className="text-xs capitalize" style={{ color: "#666666" }}>
              {admin.role}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-sm transition hover:bg-red-700"
          style={{
            backgroundColor: "#D32F2F",
            color: "#FFFFFF",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
