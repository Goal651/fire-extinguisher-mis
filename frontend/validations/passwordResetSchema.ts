import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Valid email is required"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
