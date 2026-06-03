"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { PackageSearch, Flame } from "lucide-react";
import { FireExtinguisher } from "@/types";
import { extinguisherService } from "@/services/extinguisherService";
import { useAuthContext } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import ExtinguisherTable from "@/components/extinguishers/ExtinguisherTable";

export default function ExtinguishersPage() {
  const { admin } = useAuthContext();
  const role = admin?.role;

  const [data, setData] = useState<FireExtinguisher[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { load(); }, [page, status, search]);

  const remove = async () => {
    try {
      await extinguisherService.delete(deleteId);
      toast.success("Record deleted");
      setDeleteId("");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2f2f2f" }}>
            Extinguishers
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#999" }}>
            {role === "admin"
              ? "Manage all fire extinguisher records."
              : "Browse and inspect registered extinguishers."}
          </p>
        </div>
        {role === "admin" && (
          <Link href="/dashboard/extinguishers/new">
            <Button size="sm">+ Add New</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by owner or ID…"
          className="flex-1 rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-[#2f2f2f] focus:ring-[#2f2f2f]/10 transition placeholder:text-[#c5c5c5]"
          style={{ borderColor: "#d2d2d2", backgroundColor: "#fff", color: "#2f2f2f" }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="form-select sm:w-44"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="reported">Reported</option>
          <option value="police_notified">Police Notified</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState search={search} status={status} />
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#d2d2d2" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#999" }}>
              {data.length} record{data.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="p-5">
            <ExtinguisherTable data={data} role={role} onDelete={role === "admin" ? setDeleteId : undefined} />
          </div>
          <div className="px-5 pb-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      <Modal
        open={!!deleteId}
        title="Delete Record"
        message="This will permanently remove this extinguisher record. This action cannot be undone."
        onClose={() => setDeleteId("")}
        onConfirm={remove}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="card flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-7 h-7 border-2 border-[#2f2f2f] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm" style={{ color: "#999" }}>Loading records…</p>
    </div>
  );
}

function EmptyState({ search, status }: { search: string; status: string }) {
  const hasFilter = search || status;
  return (
    <div className="card flex flex-col items-center justify-center py-16 gap-2 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#f4f4f4" }}
      >
        {hasFilter
          ? <PackageSearch size={22} style={{ color: "#999" }} />
          : <Flame size={22} style={{ color: "#999" }} />
        }
      </div>
      <p className="font-semibold" style={{ color: "#2f2f2f" }}>
        {hasFilter ? "No results found" : "No extinguishers yet"}
      </p>
      <p className="text-sm" style={{ color: "#999" }}>
        {hasFilter ? "Try adjusting your search or filter." : "Add your first record to get started."}
      </p>
    </div>
  );
}
