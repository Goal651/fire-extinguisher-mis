"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#ffffff" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2f2f2f] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: "#999" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f8f8" }}>
      <Sidebar />

      {/* Offset content for fixed desktop sidebar and fixed mobile top bar */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <div className="pt-14 lg:pt-0">
          <Header />
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
