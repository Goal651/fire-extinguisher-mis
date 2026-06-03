"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { login } from "@/services/authService";

const schema = z.object({
  email: z.string().email(),

  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);

      sessionStorage.setItem("otp_email", data.email);

      toast.success("OTP sent successfully");

      router.push("/verify-otp");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
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
          Admin Login
        </h1>

        <Input
          label="Email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          type="password"
          label="Password"
          {...register("password")}
          error={errors.password?.message}
        />

        <Button loading={isSubmitting}>Continue</Button>
      </form>

      <div className="mt-4 text-center space-y-2" style={{ color: "#666666" }}>
        <p>
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium"
            style={{ color: "#2F2F2F" }}
          >
            Register
          </a>
        </p>

        <p>
          <a
            href="/forgot-password"
            className="font-medium"
            style={{ color: "#2F2F2F" }}
          >
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
}
