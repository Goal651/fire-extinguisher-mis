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

export default function MyExtinguishersPage() {
  const { admin } = useAuthContext();
  const router = useRouter();

  const [data, setData] = useState<FireExtinguisher[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin && admin.role !== "user") {
      router.push("/dashboard");
    }
  }, [admin, router]);

  const load = async () => {
    try {
      setLoading(true);
      const response = await extinguisherService.getAll(page, 10, search, status);
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
  }, [page, status, search]);

  // Status summary counts
  const activeCount = data.filter((e) => e.status === "active").length;
  const expiredCount = data.filter((e) => e.status === "expired").length;
  const pendingInspection = data.filter(
    (e) => e.inspectionStatus === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          My Extinguishers
        </h1>
        <p className="text-sm" style={{ color: "#666666" }}>
          View the status of your registered fire extinguishers and schedule inspections.
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatusCard label="Active" count={activeCount} color="#2E7D32" bg="#E8F5E9" />
        <StatusCard label="Expired" count={expiredCount} color="#D32F2F" bg="#FFEAEA" />
        <StatusCard label="Pending Inspection" count={pendingInspection} color="#E65100" bg="#FFF3E0" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID..."
          className="border px-4 py-2 rounded-lg flex-1 min-w-0 max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#D2D2D2",
            color: "#2F2F2F",
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#D2D2D2",
            color: "#2F2F2F",
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="reported">Reported</option>
          <option value="police_notified">Police Notified</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40" style={{ color: "#666666" }}>
          Loading...
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center min-h-40" style={{ color: "#666666" }}>
          No extinguishers found
        </div>
      ) : (
        <>
          <div className="card overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
                  <th className="pb-3" style={{ color: "#2F2F2F" }}>ID</th>
                  <th className="pb-3" style={{ color: "#2F2F2F" }}>Owner</th>
                  <th className="pb-3" style={{ color: "#2F2F2F" }}>Expiry</th>
                  <th className="pb-3" style={{ color: "#2F2F2F" }}>Status</th>
                  <th className="pb-3" style={{ color: "#2F2F2F" }}>Inspection</th>
                  <th className="pb-3" style={{ color: "#2F2F2F" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((ext) => (
                  <tr
                    key={ext._id}
                    className="border-b hover:bg-gray-50 transition"
                    style={{ borderColor: "#D2D2D2" }}
                  >
                    <td className="py-4" style={{ color: "#2F2F2F" }}>
                      {ext.extinguisherId}
                    </td>
                    <td style={{ color: "#666666" }}>{ext.ownerName}</td>
                    <td style={{ color: "#666666" }}>
                      {new Date(ext.expirationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <Badge status={ext.status} />
                    </td>
                    <td>
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor:
                            ext.inspectionStatus === "completed"
                              ? "#E8F5E9"
                              : ext.inspectionStatus === "pending"
                              ? "#FFF3E0"
                              : "#F3F4F6",
                          color:
                            ext.inspectionStatus === "completed"
                              ? "#2E7D32"
                              : ext.inspectionStatus === "pending"
                              ? "#E65100"
                              : "#666666",
                        }}
                      >
                        {ext.inspectionStatus ?? "none"}
                      </span>
                    </td>
                    <td>
                      <Link href={`/dashboard/extinguishers/${ext._id}`}>
                        <Button>View & Schedule</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function StatusCard({
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
