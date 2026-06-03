"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { resetPassword } from "@/services/authService";

import { resetPasswordSchema, ResetPasswordSchema } from "@/validations/passwordResetSchema";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    try {
      await resetPassword(token, data.password);

      toast.success("Password reset successful. Please login with your new password.");

      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: "#666666" }}>
        Loading...
      </div>
    );
  }

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
          Reset Password
        </h1>

        <p style={{ color: "#666666" }}>
          Enter your new password below.
        </p>

        <Input
          type="password"
          label="New Password"
          {...registerField("password")}
          error={errors.password?.message}
        />

        <Button loading={isSubmitting}>Reset Password</Button>

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
