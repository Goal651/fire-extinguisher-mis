"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { extinguisherSchema, ExtinguisherSchema } from "@/validations/extinguisherSchema";
import { FireExtinguisherType, FireExtinguisherSize } from "@/types";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface Props {
  defaultValues?: Partial<ExtinguisherSchema>;
  onSubmit: (values: ExtinguisherSchema) => Promise<void>;
}

const TYPE_LABELS: Record<FireExtinguisherType, string> = {
  [FireExtinguisherType.WATER]:        "Water",
  [FireExtinguisherType.CO2]:          "CO₂",
  [FireExtinguisherType.FOAM]:         "Foam",
  [FireExtinguisherType.DRY_CHEMICAL]: "Dry Chemical",
};

const SIZE_LABELS: Record<string, string> = {
  "2.5LBS": "2.5 lbs",
  "5LBS":   "5 lbs",
  "9LBS":   "9 lbs",
  "12LBS":  "12 lbs",
};

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Extinguisher ─────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#999" }}>
          Extinguisher
        </legend>

        <Input
          label="Extinguisher ID"
          placeholder="e.g. EXT-2024-001"
          {...register("extinguisherId")}
          error={errors.extinguisherId?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: "#2f2f2f" }}>
              Type
            </label>
            <select
              {...register("type")}
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled>Select type…</option>
              {Object.values(FireExtinguisherType).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs flex items-center gap-1" style={{ color: "#e91e63" }}>
                <span>⚠</span> {errors.type.message}
              </p>
            )}
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: "#2f2f2f" }}>
              Size
            </label>
            <select
              {...register("size")}
              className="form-select"
              defaultValue=""
            >
              <option value="" disabled>Select size…</option>
              {Object.values(FireExtinguisherSize).map((s) => (
                <option key={s} value={s}>{SIZE_LABELS[s] ?? s}</option>
              ))}
            </select>
            {errors.size && (
              <p className="text-xs flex items-center gap-1" style={{ color: "#e91e63" }}>
                <span>⚠</span> {errors.size.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ── Owner Details ─────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#999" }}>
          Owner Details
        </legend>

        <Input
          label="Full Name"
          placeholder="Owner's full name"
          {...register("ownerName")}
          error={errors.ownerName?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="ID Number"
            placeholder="National ID / Passport"
            {...register("ownerIdNumber")}
            error={errors.ownerIdNumber?.message}
          />
          <Input
            label="Phone"
            placeholder="+250 7XX XXX XXX"
            {...register("ownerPhone")}
            error={errors.ownerPhone?.message}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="owner@example.com"
          {...register("ownerEmail")}
          error={errors.ownerEmail?.message}
        />
      </fieldset>

      {/* ── Dates ─────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#999" }}>
          Dates
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </fieldset>

      <Textarea
        label="Notes"
        placeholder="Additional notes (optional)"
        {...register("notes")}
      />

      <Button loading={isSubmitting} className="w-full">
        {isSubmitting ? "Saving…" : "Save Record"}
      </Button>
    </form>
  );
}
