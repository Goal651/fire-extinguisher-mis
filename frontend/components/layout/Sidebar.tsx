"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useState, useEffect } from "react";
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
  BarChart2,
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

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  ];

  if (role === "admin") {
    links.push(
      { href: "/dashboard/extinguishers",  label: "Extinguishers", icon: <Flame size={16} /> },
      { href: "/dashboard/users",          label: "Users",         icon: <Users size={16} /> },
      { href: "/dashboard/reports",        label: "Reports",       icon: <BarChart2 size={16} /> },
      { href: "/dashboard/data-integrity", label: "Data Integrity",icon: <ShieldCheck size={16} /> },
    );
  }

  if (role === "inspector") {
    links.push(
      { href: "/dashboard/extinguishers", label: "Extinguishers", icon: <Flame size={16} /> },
      { href: "/dashboard/inspections",   label: "Inspections",   icon: <ClipboardList size={16} /> },
      { href: "/dashboard/maintenance",   label: "Maintenance",   icon: <Wrench size={16} /> },
      { href: "/dashboard/reports",       label: "Reports",       icon: <BarChart2 size={16} /> },
    );
  }

  if (role === "user") {
    links.push(
      { href: "/dashboard/my-extinguishers", label: "My Extinguishers", icon: <Flame size={16} /> },
    );
  }

  links.push({ href: "/dashboard/profile", label: "Profile", icon: <UserCircle size={16} /> });

  const NavItems = () => (
    <nav className="space-y-0.5 flex-1">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
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
            <span className="shrink-0">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e5" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#2f2f2f" }}
          >
            <Flame size={14} color="#ffffff" strokeWidth={2} />
          </div>
          <span className="font-bold text-sm" style={{ color: "#2f2f2f" }}>FireGuard</span>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg transition-colors hover:bg-[#f4f4f4]"
          style={{ color: "#2f2f2f" }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ── Mobile drawer backdrop ─────────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#ffffff", borderRight: "1px solid #e5e5e5" }}
        aria-label="Sidebar navigation"
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 h-14 border-b shrink-0"
          style={{ borderColor: "#e5e5e5" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#2f2f2f" }}
            >
              <Flame size={14} color="#ffffff" strokeWidth={2} />
            </div>
            <span className="font-bold text-sm" style={{ color: "#2f2f2f" }}>FireGuard</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[#f4f4f4]"
            style={{ color: "#666" }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
          <UserChip admin={admin} role={role} />
          <NavItems />
        </div>
      </aside>

      {/* ── Desktop sidebar (fixed) ────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-60 z-30"
        style={{ backgroundColor: "#ffffff", borderRight: "1px solid #e5e5e5" }}
        aria-label="Sidebar navigation"
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-5 h-16 border-b shrink-0"
          style={{ borderColor: "#e5e5e5" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#2f2f2f" }}
          >
            <Flame size={16} color="#ffffff" strokeWidth={2} />
          </div>
          <span className="font-bold text-sm" style={{ color: "#2f2f2f" }}>FireGuard</span>
        </div>

        {/* Scrollable nav area */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
          <UserChip admin={admin} role={role} />
          <NavItems />
        </div>
      </aside>
    </>
  );
}

function UserChip({
  admin,
  role,
}: {
  admin: { name?: string; firstName?: string; email?: string } | null;
  role?: string;
}) {
  if (!admin) return null;
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg shrink-0"
      style={{ backgroundColor: "#f8f8f8" }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
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
  );
}
