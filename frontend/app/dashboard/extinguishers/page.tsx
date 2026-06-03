"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import toast from "react-hot-toast";

import { FireExtinguisher } from "@/types";

import { extinguisherService } from "@/services/extinguisherService";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";

import ExtinguisherTable from "@/components/extinguishers/ExtinguisherTable";

export default function Page() {
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
      const response = await extinguisherService.getAll(
        page,
        10,
        search,
        status,
      );

      setData(response.data ?? []);
      setTotalPages(response.pagination?.pages ?? 1);
    } catch (error) {
      console.error("Failed to fetch extinguishers:", error);
      toast.error("Failed to load extinguishers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status, search]);

  const remove = async () => {
    try {
      await extinguisherService.delete(deleteId);

      toast.success("Deleted successfully");

      setDeleteId("");

      load();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
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

        <Link href="/dashboard/extinguishers/new">
          <Button>Add New</Button>
        </Link>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center min-h-100"
          style={{ color: "#666666" }}
        >
          Loading...
        </div>
      ) : data.length === 0 ? (
        <div
          className="flex items-center justify-center min-h-100"
          style={{ color: "#666666" }}
        >
          No extinguishers found
        </div>
      ) : (
        <>
          <ExtinguisherTable data={data} onDelete={setDeleteId} />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        open={!!deleteId}
        title="Delete Record"
        message="Are you sure you want to delete this extinguisher record? This action cannot be undone."
        onClose={() => setDeleteId("")}
        onConfirm={remove}
      />
    </div>
  );
}
