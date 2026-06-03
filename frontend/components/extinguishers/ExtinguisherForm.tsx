"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  extinguisherSchema,
  ExtinguisherSchema,
} from "@/validations/extinguisherSchema";

import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface Props {
  defaultValues?: Partial<ExtinguisherSchema>;
  onSubmit: (values: ExtinguisherSchema) => Promise<void>;
}

export default function ExtinguisherForm({ defaultValues, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExtinguisherSchema>({
    resolver: zodResolver(extinguisherSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Extinguisher ID"
        placeholder="e.g., EXT-2024-001"
        {...register("extinguisherId")}
        error={errors.extinguisherId?.message}
      />

      <Input
        label="Owner Name"
        placeholder="Full name of the owner"
        {...register("ownerName")}
        error={errors.ownerName?.message}
      />

      <Input
        label="Owner ID Number"
        placeholder="National ID or passport number"
        {...register("ownerIdNumber")}
        error={errors.ownerIdNumber?.message}
      />

      <Input
        label="Owner Email"
        type="email"
        placeholder="owner@example.com"
        {...register("ownerEmail")}
        error={errors.ownerEmail?.message}
      />

      <Input
        label="Owner Phone"
        placeholder="Phone number with country code"
        {...register("ownerPhone")}
        error={errors.ownerPhone?.message}
      />

      <Input
        label="Issue Date"
        type="date"
        {...register("dateOfIssue")}
        error={errors.dateOfIssue?.message}
      />

      <Input
        label="Expiration Date"
        type="date"
        {...register("expirationDate")}
        error={errors.expirationDate?.message}
      />

      <Textarea
        label="Notes"
        placeholder="Additional notes or comments (optional)"
        {...register("notes")}
      />

      <Button className="w-full" loading={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
