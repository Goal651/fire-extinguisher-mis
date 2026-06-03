"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { Flame } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { login } from "@/services/authService";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);
      sessionStorage.setItem("otp_email", data.email);
      toast.success("OTP sent to your email");
      router.push("/verify-otp");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#f8f8f8" }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
            style={{ backgroundColor: "#2f2f2f" }}
          >
            <Flame size={24} color="#ffffff" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#2f2f2f" }}>FireGuard</h1>
          <p className="text-sm" style={{ color: "#999" }}>Sign in to access the dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button loading={isSubmitting}>Sign In</Button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-2 text-sm" style={{ color: "#666" }}>
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium" style={{ color: "#2f2f2f" }}>
              Register
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="font-medium" style={{ color: "#2f2f2f" }}>
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
