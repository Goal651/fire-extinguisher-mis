"use client";

import Link from "next/link";
import { FireExtinguisher, UserRole } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Props {
  data: FireExtinguisher[];
  role?: UserRole;
  onDelete?: (id: string) => void;
}

export default function ExtinguisherTable({ data, role, onDelete }: Props) {
  const canEdit = role === "admin" || role === "inspector";
  const canDelete = role === "admin";

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ext. ID</th>
            <th>Owner</th>
            <th className="hidden sm:table-cell">ID Number</th>
            <th className="hidden md:table-cell">Expiry</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ext) => (
            <tr key={ext._id}>
              <td className="font-mono text-xs font-semibold" style={{ color: "#2f2f2f" }}>
                {ext.extinguisherId}
              </td>
              <td>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#2f2f2f" }}>
                    {ext.ownerName}
                  </p>
                  <p className="text-xs sm:hidden" style={{ color: "#999" }}>
                    {ext.ownerIdNumber}
                  </p>
                </div>
              </td>
              <td className="hidden sm:table-cell text-sm" style={{ color: "#666" }}>
                {ext.ownerIdNumber}
              </td>
              <td className="hidden md:table-cell text-sm" style={{ color: "#666" }}>
                {new Date(ext.expirationDate).toLocaleDateString()}
              </td>
              <td>
                <Badge status={ext.status} size="sm" />
              </td>
              <td>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link href={`/dashboard/extinguishers/${ext._id}`}>
                    <Button size="sm" variant="secondary">View</Button>
                  </Link>
                  {canEdit && (
                    <Link href={`/dashboard/extinguishers/${ext._id}/edit`}>
                      <Button size="sm" variant="ghost">Edit</Button>
                    </Link>
                  )}
                  {canDelete && onDelete && (
                    <Button size="sm" variant="ghost"
                      onClick={() => onDelete(ext._id)}
                      style={{ color: "#d32f2f" }}
                    >
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
