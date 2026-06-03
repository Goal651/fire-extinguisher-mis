"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

interface NavLink {
  href: string;
  label: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { admin } = useAuthContext();
  const role = admin?.role;

  // Base links for every authenticated user
  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard" },
  ];

  if (role === "admin") {
    links.push(
      { href: "/dashboard/extinguishers", label: "Extinguishers" },
      { href: "/dashboard/users", label: "Users Management" },
      { href: "/dashboard/data-integrity", label: "Data Integrity" },
    );
  }

  if (role === "inspector") {
    links.push(
      { href: "/dashboard/extinguishers", label: "Extinguishers" },
      { href: "/dashboard/inspections", label: "Inspections" },
      { href: "/dashboard/maintenance", label: "Maintenance" },
    );
  }

  if (role === "user") {
    links.push(
      { href: "/dashboard/my-extinguishers", label: "My Extinguishers" },
    );
  }

  // Profile is available to everyone
  links.push({ href: "/dashboard/profile", label: "Profile" });

  return (
    <aside
      className="w-64 min-h-screen p-6 border-r flex flex-col"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#D2D2D2",
      }}
    >
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#2F2F2F" }}>
        Company XYZ
      </h1>

      {admin && (
        <p
          className="text-xs font-semibold uppercase mb-8 px-1"
          style={{ color: "#666666" }}
        >
          {role}
        </p>
      )}

      <nav className="space-y-2 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-4 py-3 transition font-medium text-sm"
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
