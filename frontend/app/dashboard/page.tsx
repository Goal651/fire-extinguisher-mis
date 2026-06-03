"use client";

import { useEffect, useState } from "react";

import { FireExtinguisher } from "@/types";

import api from "@/lib/axios";

import StatsCards from "@/components/extinguishers/StatsCards";

import Badge from "@/components/ui/Badge";

interface DashboardData {
  total: number;
  active: number;
  expired: number;
  policeNotified: number;
  recent: FireExtinguisher[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/extinguishers/dash/dashboard-stats");

        setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-100"
        style={{ color: "#666666" }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="flex items-center justify-center min-h-100"
        style={{ color: "#D32F2F" }}
      >
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards
        total={data.total}
        active={data.active}
        expired={data.expired}
        police={data.policeNotified}
      />

      <div className="card">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#2F2F2F" }}>
          Recent Records
        </h2>

        {data.recent.length === 0 ? (
          <div className="text-center py-8" style={{ color: "#666666" }}>
            No recent records found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr
                className="text-left border-b"
                style={{ borderColor: "#D2D2D2" }}
              >
                <th className="pb-3" style={{ color: "#2F2F2F" }}>
                  ID
                </th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>
                  Owner
                </th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>
                  Status
                </th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
