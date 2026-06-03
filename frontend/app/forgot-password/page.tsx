"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { forgotPassword } from "@/services/authService";

import { forgotPasswordSchema, ForgotPasswordSchema } from "@/validations/passwordResetSchema";

export default function ForgotPasswordPage() {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await forgotPassword(data.email);

      toast.success("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 rounded-lg w-full max-w-md space-y-5 shadow-lg"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D2D2D2",
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          Forgot Password
        </h1>

        <p style={{ color: "#666666" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <Input
          label="Email"
          type="email"
          {...registerField("email")}
          error={errors.email?.message}
        />

        <Button loading={isSubmitting}>Send Reset Link</Button>

        <p className="text-center" style={{ color: "#666666" }}>
          Remember your password?{" "}
          <a
            href="/login"
            className="font-medium"
            style={{ color: "#2F2F2F" }}
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
