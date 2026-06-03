"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { admin } = useAuthContext();

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      href: "/dashboard/extinguishers",
      label: "Extinguishers",
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
    },
  ];

  // Render Admin-only links
  if (admin && admin.role === "admin") {
    links.push(
      {
        href: "/dashboard/users",
        label: "Users Management",
      },
      {
        href: "/dashboard/data-integrity",
        label: "Data Integrity",
      }
    );
  }

  return (
    <aside
      className="w-64 min-h-screen p-6 border-r"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#D2D2D2",
      }}
    >
      <h1 className="text-2xl font-bold mb-8" style={{ color: "#2F2F2F" }}>
        Company XYZ
      </h1>

      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-4 py-3 transition"
            style={{
              backgroundColor:
                pathname === link.href ? "#2F2F2F" : "transparent",
              color: pathname === link.href ? "#FFFFFF" : "#666666",
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
