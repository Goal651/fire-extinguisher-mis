"use client";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { extinguisherService } from "@/services/extinguisherService";

import ExtinguisherForm from "@/components/extinguishers/ExtinguisherForm";

export default function Page() {
  const router = useRouter();

  return (
    <div className="card">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#2F2F2F" }}>
        Create Extinguisher
      </h1>

      <ExtinguisherForm
        onSubmit={async (values) => {
          await extinguisherService.create(values);

          toast.success("Created");

          router.push("/dashboard/extinguishers");
        }}
      />
    </div>
  );
}
