"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";
import {
  LayoutDashboard,
  Flame,
  Users,
  ShieldCheck,
  ClipboardList,
  Wrench,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { admin } = useAuthContext();
  const role = admin?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  ];

  if (role === "admin") {
    links.push(
      { href: "/dashboard/extinguishers", label: "Extinguishers", icon: <Flame size={16} /> },
      { href: "/dashboard/users", label: "Users", icon: <Users size={16} /> },
      { href: "/dashboard/data-integrity", label: "Data Integrity", icon: <ShieldCheck size={16} /> },
    );
  }

  if (role === "inspector") {
    links.push(
      { href: "/dashboard/extinguishers", label: "Extinguishers", icon: <Flame size={16} /> },
      { href: "/dashboard/inspections", label: "Inspections", icon: <ClipboardList size={16} /> },
      { href: "/dashboard/maintenance", label: "Maintenance", icon: <Wrench size={16} /> },
    );
  }

  if (role === "user") {
    links.push(
      { href: "/dashboard/my-extinguishers", label: "My Extinguishers", icon: <Flame size={16} /> },
    );
  }

  links.push({ href: "/dashboard/profile", label: "Profile", icon: <UserCircle size={16} /> });

  const NavItems = () => (
    <nav className="space-y-0.5">
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
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f4f4f4";
            }}
            onMouseLeave={(e) => {
              if (!active)
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
            }}
          >
            <span className="flex-shrink-0">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────── */}
      <div
        className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40"
        style={{ backgroundColor: "#ffffff", borderColor: "#d2d2d2" }}
      >
        <div className="flex items-center gap-2">
          <Flame size={18} strokeWidth={2} style={{ color: "#2f2f2f" }} />
          <span className="font-bold text-sm" style={{ color: "#2f2f2f" }}>FireGuard</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-1.5 rounded-lg transition"
          style={{ color: "#2f2f2f" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile drawer ──────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} />
          <aside
            className="absolute top-0 left-0 h-full w-60 p-5 space-y-6 z-10"
            style={{ backgroundColor: "#ffffff", borderRight: "1px solid #d2d2d2" }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarHeader admin={admin} role={role} />
            <NavItems />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-60 p-5 gap-6 sticky top-0 self-start"
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
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#2f2f2f" }}
        >
          <Flame size={16} color="#ffffff" strokeWidth={2} />
        </div>
        <span className="font-bold text-sm" style={{ color: "#2f2f2f" }}>FireGuard</span>
      </div>

      {/* User chip */}
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
            <p className="text-[10px] capitalize" style={{ color: "#999" }}>{role}</p>
          </div>
        </div>
      )}
    </div>
  );
}
