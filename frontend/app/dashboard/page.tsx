"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FireExtinguisher } from "@/types";
import api from "@/lib/axios";
import StatsCards from "@/components/extinguishers/StatsCards";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuthContext } from "@/context/AuthContext";

interface DashboardData {
  total: number;
  active: number;
  expired: number;
  policeNotified: number;
  recent: FireExtinguisher[];
}

const ROLE_META = {
  admin: {
    subtitle: "Full system access — manage extinguishers, users, and data integrity.",
    quickActions: [
      { title: "Extinguishers", desc: "View, add, edit and remove records.", href: "/dashboard/extinguishers", icon: "🧯" },
      { title: "Users", desc: "Manage admin, inspector and user accounts.", href: "/dashboard/users", icon: "👥" },
      { title: "Data Integrity", desc: "Run diagnostics and auto-cleanup.", href: "/dashboard/data-integrity", icon: "🔍" },
    ],
  },
  inspector: {
    subtitle: "Conduct inspections, log results and schedule maintenance.",
    quickActions: [
      { title: "Inspections", desc: "View and log pending inspections.", href: "/dashboard/inspections", icon: "📋" },
      { title: "Maintenance", desc: "Track and schedule maintenance tasks.", href: "/dashboard/maintenance", icon: "🔧" },
      { title: "Extinguishers", desc: "Browse all registered records.", href: "/dashboard/extinguishers", icon: "🧯" },
    ],
  },
  user: {
    subtitle: "View your extinguisher status and request inspections.",
    quickActions: [
      { title: "My Extinguishers", desc: "Check the status of your records.", href: "/dashboard/my-extinguishers", icon: "🧯" },
    ],
  },
};

export default function DashboardPage() {
  const { admin } = useAuthContext();
  const role = admin?.role ?? "user";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/extinguishers/dash/dashboard-stats")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const meta = ROLE_META[role] ?? ROLE_META.user;
  const displayName =
    admin?.name ||
    `${admin?.firstName ?? ""}`.trim() ||
    "there";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-xl px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ backgroundColor: "#2f2f2f", color: "#fff" }}
      >
        <div>
          <h1 className="text-xl font-bold">Welcome back, {displayName} 👋</h1>
          <p className="text-sm mt-1" style={{ color: "#aaa" }}>{meta.subtitle}</p>
        </div>
        <span
          className="text-xs font-semibold uppercase px-3 py-1.5 rounded-full self-start sm:self-auto"
          style={{ backgroundColor: "#ffffff22", color: "#fff", border: "1px solid #ffffff33" }}
        >
          {role}
        </span>
      </div>

      {/* Stats — admin & inspector only */}
      {(role === "admin" || role === "inspector") && !loading && data && (
        <StatsCards
          total={data.total}
          active={data.active}
          expired={data.expired}
          police={data.policeNotified}
        />
      )}
      {(role === "admin" || role === "inspector") && loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-5 border animate-pulse" style={{ backgroundColor: "#f8f8f8", borderColor: "#e8e8e8" }}>
              <div className="h-3 w-16 rounded" style={{ backgroundColor: "#e0e0e0" }} />
              <div className="h-8 w-12 rounded mt-3" style={{ backgroundColor: "#e0e0e0" }} />
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {meta.quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="block group">
              <div
                className="card h-full flex flex-col gap-3 transition-all duration-150 group-hover:shadow-md group-hover:border-[#2f2f2f]/20"
                style={{ cursor: "pointer" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: "#f8f8f8" }}
                >
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "#2f2f2f" }}>{action.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#999" }}>{action.desc}</p>
                </div>
                <span className="text-xs font-medium" style={{ color: "#2f2f2f" }}>
                  Go →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent records — admin & inspector */}
      {(role === "admin" || role === "inspector") && data && data.recent.length > 0 && (
        <div className="card !p-0 overflow-hidden">
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#d2d2d2" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "#2f2f2f" }}>
              Recent Records
            </h2>
            <Link href="/dashboard/extinguishers">
              <Button size="sm" variant="ghost">View all →</Button>
            </Link>
          </div>
          <div className="table-wrap px-5 pb-5">
            <table className="data-table mt-4">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Expiry</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.recent.map((item) => (
                  <tr key={item._id}>
                    <td className="font-mono text-xs font-semibold" style={{ color: "#2f2f2f" }}>
                      {item.extinguisherId}
                    </td>
                    <td className="text-sm" style={{ color: "#666" }}>{item.ownerName}</td>
                    <td><Badge status={item.status} size="sm" /></td>
                    <td className="hidden sm:table-cell text-sm" style={{ color: "#666" }}>
                      {new Date(item.expirationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <Link href={`/dashboard/extinguishers/${item._id}`}>
                        <Button size="sm" variant="secondary">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
