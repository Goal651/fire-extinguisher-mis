import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .trim(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .trim(),
  email: z
    .string()
    .email("Valid email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
