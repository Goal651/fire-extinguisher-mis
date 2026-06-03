"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { getToken } from "@/lib/auth";

export const useAuth = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");

      return;
    }

    setLoading(false);
  }, [router]);

  return {
    loading,
  };
};
