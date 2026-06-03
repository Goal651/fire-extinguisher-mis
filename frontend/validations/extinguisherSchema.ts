import { z } from "zod";
import { FireExtinguisherType, FireExtinguisherSize } from "@/types";

export const extinguisherSchema = z
  .object({
    extinguisherId: z.string().min(1, "Extinguisher ID is required"),

    type: z.nativeEnum(FireExtinguisherType, {
      errorMap: () => ({ message: "Select a type" }),
    }),

    size: z.nativeEnum(FireExtinguisherSize, {
      errorMap: () => ({ message: "Select a size" }),
    }),

    ownerName: z.string().min(2),

    ownerIdNumber: z.string().min(1),

    ownerEmail: z.string().email(),

    ownerPhone: z.string().min(1),

    dateOfIssue: z.string(),

    expirationDate: z.string(),

    notes: z.string().optional(),
  })
  .refine((data) => new Date(data.expirationDate) > new Date(), {
    path: ["expirationDate"],
    message: "Expiration date must be in the future",
  })
  .refine(
    (data) => new Date(data.dateOfIssue) < new Date(data.expirationDate),
    {
      path: ["dateOfIssue"],
      message: "Issue date must be before expiration date",
    },
  );

export type ExtinguisherSchema = z.infer<typeof extinguisherSchema>;
