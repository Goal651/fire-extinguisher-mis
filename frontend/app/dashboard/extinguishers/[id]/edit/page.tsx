"use client";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { useParams, useRouter } from "next/navigation";

import { FireExtinguisher } from "@/types";

import { extinguisherService } from "@/services/extinguisherService";

import ExtinguisherForm from "@/components/extinguishers/ExtinguisherForm";

import { ExtinguisherSchema } from "@/validations/extinguisherSchema";

export default function Page() {
  const params = useParams();

  const router = useRouter();

  const [extinguisher, setExtinguisher] = useState<FireExtinguisher>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await extinguisherService.getOne(params.id as string);
        setExtinguisher(response.data);
      } catch (error) {
        console.error("Failed to fetch extinguisher:", error);
        toast.error("Failed to load extinguisher");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-100"
        style={{ color: "#666666" }}
      >
        Loading...
      </div>
    );
  }

  if (!extinguisher) {
    return (
      <div
        className="flex items-center justify-center min-h-100"
        style={{ color: "#D32F2F" }}
      >
        Extinguisher not found
      </div>
    );
  }

  const defaultValues: Partial<ExtinguisherSchema> = {
    ...extinguisher,
    dateOfIssue: extinguisher.dateOfIssue
      ? (extinguisher.dateOfIssue as string).split("T")[0]
      : "",
    expirationDate: extinguisher.expirationDate
      ? (extinguisher.expirationDate as string).split("T")[0]
      : "",
  };

  return (
    <div className="card">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#2F2F2F" }}>
        Edit Extinguisher
      </h1>

      <ExtinguisherForm
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          try {
            await extinguisherService.update(extinguisher._id, values);
            toast.success("Updated successfully");
            router.push("/dashboard/extinguishers");
          } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update extinguisher");
          }
        }}
      />
    </div>
  );
}
