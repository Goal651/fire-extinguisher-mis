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

export default function InspectionsPage() {
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
      // Filter to only extinguishers with pending inspection or all — inspector can see all
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

  // Separate into pending and completed inspection groups
  const pending = data.filter(
    (e) => e.inspectionStatus === "pending" || e.inspectionStatus === "none"
  );
  const completed = data.filter((e) => e.inspectionStatus === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          Inspections
        </h1>
        <p className="text-sm" style={{ color: "#666666" }}>
          Manage and conduct extinguisher inspections. Click on an extinguisher to log an inspection result.
        </p>
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
          {/* Pending / Due Inspections */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "#2F2F2F" }}>
              Pending Inspections
              <span
                className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
              >
                {pending.length}
              </span>
            </h2>

            {pending.length === 0 ? (
              <div
                className="card text-center py-6 text-sm"
                style={{ color: "#666666" }}
              >
                No pending inspections
              </div>
            ) : (
              <div className="card overflow-auto">
                <InspectionTable items={pending} />
              </div>
            )}
          </section>

          {/* Completed Inspections */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "#2F2F2F" }}>
              Completed Inspections
              <span
                className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
              >
                {completed.length}
              </span>
            </h2>

            {completed.length === 0 ? (
              <div
                className="card text-center py-6 text-sm"
                style={{ color: "#666666" }}
              >
                No completed inspections yet
              </div>
            ) : (
              <div className="card overflow-auto">
                <InspectionTable items={completed} />
              </div>
            )}
          </section>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function InspectionTable({ items }: { items: FireExtinguisher[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Extinguisher ID</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Owner</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Status</th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>Inspection Status</th>
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
            <td style={{ color: "#666666" }}>
              {ext.scheduledInspectionDate
                ? new Date(ext.scheduledInspectionDate).toLocaleDateString()
                : "—"}
            </td>
            <td>
              <Link href={`/dashboard/extinguishers/${ext._id}`}>
                <Button>Inspect</Button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
