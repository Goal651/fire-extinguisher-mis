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

export default function DashboardPage() {
  const { admin } = useAuthContext();
  const role = admin?.role;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/extinguishers/dash/dashboard-stats");
        setData(response.data.data);
      } catch {
        // non-critical — some roles may not have access
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40" style={{ color: "#666666" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#2F2F2F", color: "#FFFFFF" }}
      >
        <h1 className="text-2xl font-bold">
          Welcome back{admin?.name ? `, ${admin.name}` : ""}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#AAAAAA" }}>
          {role === "admin" && "You have full system access. Manage extinguishers, users, and data integrity."}
          {role === "inspector" && "Conduct inspections, log results, and schedule maintenance from the sidebar."}
          {role === "user" && "View your extinguisher status and request inspections from My Extinguishers."}
        </p>
      </div>

      {/* Stats — visible to admin and inspector */}
      {(role === "admin" || role === "inspector") && data && (
        <StatsCards
          total={data.total}
          active={data.active}
          expired={data.expired}
          police={data.policeNotified}
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {role === "admin" && (
          <>
            <QuickAction
              title="Manage Extinguishers"
              description="View, add, edit, or remove extinguisher records."
              href="/dashboard/extinguishers"
              label="Go to Extinguishers"
            />
            <QuickAction
              title="User Accounts"
              description="Create and manage admin, inspector, and user accounts."
              href="/dashboard/users"
              label="Manage Users"
            />
            <QuickAction
              title="Data Integrity"
              description="Run diagnostics and compliance cleanup on the database."
              href="/dashboard/data-integrity"
              label="Run Diagnostics"
            />
          </>
        )}

        {role === "inspector" && (
          <>
            <QuickAction
              title="Pending Inspections"
              description="View and conduct outstanding extinguisher inspections."
              href="/dashboard/inspections"
              label="View Inspections"
            />
            <QuickAction
              title="Maintenance Schedule"
              description="Track and schedule extinguisher maintenance tasks."
              href="/dashboard/maintenance"
              label="View Maintenance"
            />
            <QuickAction
              title="All Extinguishers"
              description="Browse all registered extinguishers in the system."
              href="/dashboard/extinguishers"
              label="Browse All"
            />
          </>
        )}

        {role === "user" && (
          <>
            <QuickAction
              title="My Extinguishers"
              description="View the status of your registered fire extinguishers."
              href="/dashboard/my-extinguishers"
              label="View Status"
            />
            <QuickAction
              title="Schedule Inspection"
              description="Request an inspection for one of your extinguishers."
              href="/dashboard/my-extinguishers"
              label="Schedule Now"
            />
          </>
        )}
      </div>

      {/* Recent Records — admin and inspector */}
      {(role === "admin" || role === "inspector") && data && data.recent.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#2F2F2F" }}>
            Recent Records
          </h2>
          <table className="w-full">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>ID</th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Owner</th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Status</th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((item) => (
                <tr
                  key={item._id}
                  className="border-b hover:bg-gray-50 transition"
                  style={{ borderColor: "#D2D2D2" }}
                >
                  <td className="py-4" style={{ color: "#2F2F2F" }}>
                    {item.extinguisherId}
                  </td>
                  <td style={{ color: "#666666" }}>{item.ownerName}</td>
                  <td>
                    <Badge status={item.status} />
                  </td>
                  <td>
                    <Link href={`/dashboard/extinguishers/${item._id}`}>
                      <Button>View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <div
      className="card flex flex-col justify-between gap-4"
      style={{ minHeight: "140px" }}
    >
      <div>
        <h3 className="font-bold text-base" style={{ color: "#2F2F2F" }}>
          {title}
        </h3>
        <p className="text-sm mt-1" style={{ color: "#666666" }}>
          {description}
        </p>
      </div>
      <Link href={href}>
        <Button className="w-full">{label}</Button>
      </Link>
    </div>
  );
}
