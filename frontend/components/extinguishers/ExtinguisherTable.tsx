"use client";

import Link from "next/link";

import { FireExtinguisher } from "@/types";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Props {
  data: FireExtinguisher[];
  onDelete: (id: string) => void;
}

export default function ExtinguisherTable({ data, onDelete }: Props) {
  return (
    <div className="card overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
            <th className="pb-3" style={{ color: "#2F2F2F" }}>
              ID
            </th>

            <th className="pb-3" style={{ color: "#2F2F2F" }}>
              Owner
            </th>

            <th className="pb-3" style={{ color: "#2F2F2F" }}>
              ID Number
            </th>

            <th className="pb-3" style={{ color: "#2F2F2F" }}>
              Expiry
            </th>

            <th className="pb-3" style={{ color: "#2F2F2F" }}>
              Status
            </th>

            <th className="pb-3" style={{ color: "#2F2F2F" }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((extinguisher) => (
            <tr
              key={extinguisher._id}
              className="border-b hover:bg-gray-50 transition"
              style={{ borderColor: "#D2D2D2" }}
            >
              <td className="py-4" style={{ color: "#2F2F2F" }}>
                {extinguisher.extinguisherId}
              </td>

              <td style={{ color: "#666666" }}>{extinguisher.ownerName}</td>

              <td style={{ color: "#666666" }}>{extinguisher.ownerIdNumber}</td>

              <td style={{ color: "#666666" }}>
                {new Date(extinguisher.expirationDate).toLocaleDateString()}
              </td>

              <td>
                <Badge status={extinguisher.status} />
              </td>

              <td>
                <div className="flex gap-2">
                  <Link href={`/dashboard/extinguishers/${extinguisher._id}`}>
                    <Button>View</Button>
                  </Link>

                  <Link
                    href={`/dashboard/extinguishers/${extinguisher._id}/edit`}
                  >
                    <Button>Edit</Button>
                  </Link>

                  <Button
                    variant="danger"
                    onClick={() => onDelete(extinguisher._id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
