import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "TZW LTD",
  description: "Fire Extinguisher Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
