"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFFFFF", color: "#2F2F2F" }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main
          className="p-6 min-h-screen"
          style={{ backgroundColor: "#FBFBFB" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
