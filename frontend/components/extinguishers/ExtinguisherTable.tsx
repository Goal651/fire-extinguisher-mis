"use client";

import Link from "next/link";
import { FireExtinguisher } from "@/types";
import { UserRole } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Props {
  data: FireExtinguisher[];
  role?: UserRole;
  /** Called when admin/inspector requests delete */
  onDelete?: (id: string) => void;
}

export default function ExtinguisherTable({ data, role, onDelete }: Props) {
  const canEdit = role === "admin" || role === "inspector";
  const canDelete = role === "admin";

  return (
    <div className="card overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
            <th className="pb-3" style={{ color: "#2F2F2F" }}>ID</th>
            <th className="pb-3" style={{ color: "#2F2F2F" }}>Owner</th>
            <th className="pb-3" style={{ color: "#2F2F2F" }}>ID Number</th>
            <th className="pb-3" style={{ color: "#2F2F2F" }}>Expiry</th>
            <th className="pb-3" style={{ color: "#2F2F2F" }}>Status</th>
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
              <td style={{ color: "#666666" }}>{ext.ownerIdNumber}</td>
              <td style={{ color: "#666666" }}>
                {new Date(ext.expirationDate).toLocaleDateString()}
              </td>
              <td>
                <Badge status={ext.status} />
              </td>
              <td>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/dashboard/extinguishers/${ext._id}`}>
                    <Button>View</Button>
                  </Link>
                  {canEdit && (
                    <Link href={`/dashboard/extinguishers/${ext._id}/edit`}>
                      <Button>Edit</Button>
                    </Link>
                  )}
                  {canDelete && onDelete && (
                    <Button variant="danger" onClick={() => onDelete(ext._id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
