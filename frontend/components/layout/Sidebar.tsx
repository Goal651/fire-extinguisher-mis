"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { admin } = useAuthContext();
  const role = admin?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  ];

  if (role === "admin") {
    links.push(
      { href: "/dashboard/extinguishers", label: "Extinguishers", icon: "🧯" },
      { href: "/dashboard/users", label: "Users", icon: "👥" },
      { href: "/dashboard/data-integrity", label: "Data Integrity", icon: "🔍" },
    );
  }

  if (role === "inspector") {
    links.push(
      { href: "/dashboard/extinguishers", label: "Extinguishers", icon: "🧯" },
      { href: "/dashboard/inspections", label: "Inspections", icon: "📋" },
      { href: "/dashboard/maintenance", label: "Maintenance", icon: "🔧" },
    );
  }

  if (role === "user") {
    links.push(
      { href: "/dashboard/my-extinguishers", label: "My Extinguishers", icon: "🧯" },
    );
  }

  links.push({ href: "/dashboard/profile", label: "Profile", icon: "👤" });

  const NavItems = () => (
    <nav className="space-y-1">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: active ? "#2f2f2f" : "transparent",
              color: active ? "#ffffff" : "#666666",
            }}
            onMouseEnter={(e) => {
              if (!active)
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f8f8f8";
            }}
            onMouseLeave={(e) => {
              if (!active)
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
            }}
          >
            <span className="text-base leading-none w-5 text-center flex-shrink-0">
              {link.icon}
            </span>
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile top bar trigger ─────────────────────── */}
      <div
        className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40"
        style={{ backgroundColor: "#ffffff", borderColor: "#d2d2d2" }}
      >
        <span className="font-bold text-sm" style={{ color: "#2f2f2f" }}>
          🧯 FireGuard
        </span>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg transition"
          style={{ color: "#2f2f2f" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          />
          <aside
            className="absolute top-0 left-0 h-full w-64 p-5 space-y-6 z-10"
            style={{
              backgroundColor: "#ffffff",
              borderRight: "1px solid #d2d2d2",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarHeader admin={admin} role={role} />
            <NavItems />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ───────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-60 min-h-screen p-5 gap-6 sticky top-0 self-start"
        style={{
          backgroundColor: "#ffffff",
          borderRight: "1px solid #d2d2d2",
          height: "100vh",
        }}
      >
        <SidebarHeader admin={admin} role={role} />
        <NavItems />
      </aside>
    </>
  );
}

function SidebarHeader({
  admin,
  role,
}: {
  admin: { name?: string; firstName?: string; email?: string } | null;
  role?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: "#2f2f2f", color: "#fff" }}
        >
          🧯
        </div>
        <span className="font-bold text-sm" style={{ color: "#2f2f2f" }}>
          FireGuard
        </span>
      </div>

      {admin && (
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
          style={{ backgroundColor: "#f8f8f8" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "#2f2f2f", color: "#fff" }}
          >
            {(admin.name || admin.firstName || admin.email || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "#2f2f2f" }}>
              {admin.name || admin.firstName || admin.email}
            </p>
            <p className="text-[10px] capitalize" style={{ color: "#999" }}>
              {role}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
