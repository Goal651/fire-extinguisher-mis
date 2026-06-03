"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FireExtinguisher } from "@/types";
import { extinguisherService } from "@/services/extinguisherService";
import { useAuthContext } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";

export default function MaintenancePage() {
  const { admin } = useAuthContext();
  const router = useRouter();

  const [data, setData] = useState<FireExtinguisher[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin && admin.role !== "inspector") {
      router.push("/dashboard");
    }
  }, [admin, router]);

  const load = async () => {
    try {
      setLoading(true);
      const response = await extinguisherService.getAll(page, 10, search, "");
      setData(response.data ?? []);
      setTotalPages(response.pagination?.pages ?? 1);
    } catch {
      toast.error("Failed to load extinguishers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  const scheduled = data.filter((e) => e.maintenanceStatus === "scheduled");
  const completed = data.filter((e) => e.maintenanceStatus === "completed");
  const unscheduled = data.filter(
    (e) => !e.maintenanceStatus || e.maintenanceStatus === "none"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          Maintenance Scheduling
        </h1>
        <p className="text-sm" style={{ color: "#666666" }}>
          Track and schedule maintenance for fire extinguishers. Click on an
          extinguisher to schedule or update maintenance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Scheduled" count={scheduled.length} color="#1976D2" bg="#EAF6FF" />
        <SummaryCard label="Completed" count={completed.length} color="#2E7D32" bg="#E8F5E9" />
        <SummaryCard label="Not Scheduled" count={unscheduled.length} color="#666666" bg="#F3F4F6" />
      </div>

      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by owner name or ID..."
          className="border px-4 py-2 rounded-lg flex-1 max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#D2D2D2",
            color: "#2F2F2F",
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40" style={{ color: "#666666" }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Scheduled maintenance */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "#2F2F2F" }}>
              Scheduled Maintenance
            </h2>
            {scheduled.length === 0 ? (
              <div className="card text-center py-6 text-sm" style={{ color: "#666666" }}>
                No scheduled maintenance
              </div>
            ) : (
              <div className="card overflow-auto">
                <MaintenanceTable items={scheduled} />
              </div>
            )}
          </section>

          {/* Unscheduled */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "#2F2F2F" }}>
              Needs Scheduling
            </h2>
            {unscheduled.length === 0 ? (
              <div className="card text-center py-6 text-sm" style={{ color: "#666666" }}>
                All extinguishers have maintenance scheduled
              </div>
            ) : (
              <div className="card overflow-auto">
                <MaintenanceTable items={unscheduled} />
              </div>
            )}
          </section>

          {/* Completed */}
          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold" style={{ color: "#2F2F2F" }}>
                Completed Maintenance
              </h2>
              <div className="card overflow-auto">
                <MaintenanceTable items={completed} />
              </div>
            </section>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  count,
  color,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: bg, borderColor: color + "33" }}
    >
      <p className="text-sm font-medium" style={{ color: "#666666" }}>
        {label}
      </p>
      <p className="text-3xl font-bold mt-1" style={{ color }}>
        {count}
      </p>
    </div>
  );
}

function MaintenanceTable({ items }: { items: FireExtinguisher[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Extinguisher ID</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Owner</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Status</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Maintenance Status</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Scheduled Date</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((ext) => (
          <tr
            key={ext._id}
            className="border-b hover:bg-gray-50 transition"
            style={{ borderColor: "#D2D2D2" }}
          >
            <td className="py-4" style={{ color: "#2F2F2F" }}>
              {ext.extinguisherId}
            </td>
            <td style={{ color: "#666666" }}>{ext.ownerName}</td>
            <td>
              <Badge status={ext.status} />
            </td>
            <td>
              <span
                className="px-2 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor:
                    ext.maintenanceStatus === "completed"
                      ? "#E8F5E9"
                      : ext.maintenanceStatus === "scheduled"
                      ? "#EAF6FF"
                      : "#F3F4F6",
                  color:
                    ext.maintenanceStatus === "completed"
                      ? "#2E7D32"
                      : ext.maintenanceStatus === "scheduled"
                      ? "#1976D2"
                      : "#666666",
                }}
              >
                {ext.maintenanceStatus ?? "none"}
              </span>
            </td>
            <td style={{ color: "#666666" }}>
              {ext.scheduledMaintenanceDate
                ? new Date(ext.scheduledMaintenanceDate).toLocaleDateString()
                : "—"}
            </td>
            <td>
              <Link href={`/dashboard/extinguishers/${ext._id}`}>
                <Button>
                  {ext.maintenanceStatus === "none" || !ext.maintenanceStatus
                    ? "Schedule"
                    : "View"}
                </Button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
