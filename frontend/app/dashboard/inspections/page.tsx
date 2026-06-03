"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FireExtinguisher } from "@/types";
import { extinguisherService } from "@/services/extinguisherService";
import { useAuthContext } from "@/context/AuthContext";
import {
  shouldShowInspectForm,
} from "@/lib/extinguisherIntelligence";
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

  // Intelligence-based grouping
  const needsInspection = data.filter((e) => shouldShowInspectForm(e));
  // Overdue = scheduled date already passed and still pending
  const overdue = needsInspection.filter(
    (e) =>
      e.scheduledInspectionDate &&
      new Date(e.scheduledInspectionDate) < new Date()
  );
  const pending = needsInspection.filter(
    (e) =>
      e.inspectionStatus === "pending" &&
      (!e.scheduledInspectionDate ||
        new Date(e.scheduledInspectionDate) >= new Date())
  );
  const due = needsInspection.filter(
    (e) =>
      e.inspectionStatus === "none" ||
      (!e.scheduledInspectionDate && e.inspectionStatus !== "pending")
  );

  const recentlyCompleted = data.filter(
    (e) => !shouldShowInspectForm(e) && e.inspectionStatus === "completed"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          Inspections
        </h1>
        <p className="text-sm" style={{ color: "#666666" }}>
          Only extinguishers that need attention are shown. Up-to-date ones are
          listed separately below.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        <Chip label="Overdue" count={overdue.length} color="#D32F2F" bg="#FFEAEA" />
        <Chip label="Pending" count={pending.length} color="#E65100" bg="#FFF3E0" />
        <Chip label="Due" count={due.length} color="#1976D2" bg="#EAF6FF" />
        <Chip
          label="Up-to-date"
          count={recentlyCompleted.length}
          color="#2E7D32"
          bg="#E8F5E9"
        />
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by owner name or ID..."
        className="border px-4 py-2 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#D2D2D2",
          color: "#2F2F2F",
        }}
      />

      {loading ? (
        <div
          className="flex items-center justify-center min-h-40"
          style={{ color: "#666666" }}
        >
          Loading...
        </div>
      ) : (
        <>
          {/* Overdue */}
          {overdue.length > 0 && (
            <Section
              title="Overdue Inspections"
              titleColor="#D32F2F"
              items={overdue}
              actionLabel="Inspect Now"
            />
          )}

          {/* Pending (scheduled, date not yet passed) */}
          {pending.length > 0 && (
            <Section
              title="Scheduled — Upcoming"
              titleColor="#E65100"
              items={pending}
              actionLabel="Inspect"
            />
          )}

          {/* No inspection at all */}
          {due.length > 0 && (
            <Section
              title="Due for Inspection"
              titleColor="#1976D2"
              items={due}
              actionLabel="Inspect"
            />
          )}

          {needsInspection.length === 0 && (
            <div
              className="card text-center py-8 text-sm"
              style={{ color: "#2E7D32" }}
            >
              ✅ All extinguishers are up-to-date. No inspections needed right now.
            </div>
          )}

          {/* Up-to-date — collapsed summary */}
          {recentlyCompleted.length > 0 && (
            <details className="card">
              <summary
                className="cursor-pointer text-sm font-medium select-none"
                style={{ color: "#666666" }}
              >
                {recentlyCompleted.length} up-to-date extinguisher
                {recentlyCompleted.length !== 1 ? "s" : ""} (recently
                inspected)
              </summary>
              <div className="mt-4 overflow-auto">
                <InspectionTable items={recentlyCompleted} actionLabel="View" />
              </div>
            </details>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  titleColor,
  items,
  actionLabel,
}: {
  title: string;
  titleColor: string;
  items: FireExtinguisher[];
  actionLabel: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold" style={{ color: titleColor }}>
        {title}
        <span
          className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
          style={{ backgroundColor: titleColor + "15", color: titleColor }}
        >
          {items.length}
        </span>
      </h2>
      <div className="card overflow-auto">
        <InspectionTable items={items} actionLabel={actionLabel} />
      </div>
    </section>
  );
}

function InspectionTable({
  items,
  actionLabel,
}: {
  items: FireExtinguisher[];
  actionLabel: string;
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>
            Extinguisher ID
          </th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>
            Owner
          </th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>
            Status
          </th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>
            Inspection
          </th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>
            Scheduled Date
          </th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>
            Last Inspected
          </th>
          <th className="pb-3" style={{ color: "#2F2F2F" }}>
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((ext) => {
          const lastLog = ext.inspectionLogs?.[ext.inspectionLogs.length - 1];
          return (
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
                <StatusPill value={ext.inspectionStatus ?? "none"} />
              </td>
              <td style={{ color: "#666666" }}>
                {ext.scheduledInspectionDate
                  ? new Date(
                      ext.scheduledInspectionDate
                    ).toLocaleDateString()
                  : "—"}
              </td>
              <td style={{ color: "#666666" }}>
                {lastLog
                  ? new Date(lastLog.inspectedAt).toLocaleDateString()
                  : "Never"}
              </td>
              <td>
                <Link href={`/dashboard/extinguishers/${ext._id}`}>
                  <Button>{actionLabel}</Button>
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Chip({
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
      style={{ backgroundColor: bg, borderColor: color + "33", color }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {count}
      </span>
      {label}
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    completed: { bg: "#E8F5E9", text: "#2E7D32" },
    pending: { bg: "#FFF3E0", text: "#E65100" },
    none: { bg: "#F3F4F6", text: "#666666" },
  };
  const c = colorMap[value] ?? colorMap.none;
  return (
    <span
      className="px-2 py-1 text-xs font-semibold rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {value}
    </span>
  );
}
