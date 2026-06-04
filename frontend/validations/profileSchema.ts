import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .trim(),
  lastName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .trim(),
  email: z
    .string()
    .email("Valid email is required"),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
