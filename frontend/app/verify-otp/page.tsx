"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { verifyOtp, resendOtp } from "@/services/authService";

import { saveToken } from "@/lib/auth";

export default function VerifyOtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");

  const [timer, setTimer] = useState(600);

  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("otp_email") : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    try {
      const result = await verifyOtp(email!, otp);

      saveToken(result.token);

      toast.success("Login successful");

      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(email!);

      setTimer(600);

      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div
        className="p-8 rounded-lg w-full max-w-md shadow-lg"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D2D2D2",
        }}
      >
        <h1 className="text-2xl font-bold mb-5" style={{ color: "#2F2F2F" }}>
          Verify OTP
        </h1>

        <input
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full text-center text-3xl tracking-[12px] rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#D2D2D2",
            color: "#2F2F2F",
            borderWidth: "1px",
          }}
        />

        <p className="mt-4" style={{ color: "#666666" }}>
          {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
        </p>

        <button
          onClick={handleVerify}
          className="w-full py-3 rounded-lg mt-6 transition"
          style={{
            backgroundColor: "#2F2F2F",
            color: "#FFFFFF",
          }}
        >
          Verify OTP
        </button>

        <button
          disabled={timer > 0}
          onClick={handleResend}
          className="w-full mt-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            color: timer > 0 ? "#C5C5C5" : "#2F2F2F",
          }}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}
