"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { register } from "@/services/authService";

import { registerSchema, RegisterSchema } from "@/validations/registerSchema";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await register(data.name, data.email, data.password);

      toast.success("Registration successful. Please login.");

      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
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
          Create Account
        </h1>

        <Input
          label="Full Name"
          {...registerField("name")}
          error={errors.name?.message}
        />

        <Input
          label="Email"
          type="email"
          {...registerField("email")}
          error={errors.email?.message}
        />

        <Input
          type="password"
          label="Password"
          {...registerField("password")}
          error={errors.password?.message}
        />

        <Button loading={isSubmitting}>Register</Button>

        <p className="text-center" style={{ color: "#666666" }}>
          Already have an account?{" "}
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
