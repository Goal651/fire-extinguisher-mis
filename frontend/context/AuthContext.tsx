"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { Admin } from "@/types";

import * as authService from "@/services/authService";

import { clearToken, getToken, saveToken } from "@/lib/auth";

interface AuthContextType {
  admin: Admin | null;

  loading: boolean;

  login: (token: string, admin: Admin) => void;

  logout: () => void;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();

      setAdmin(response.data);
    } catch {
      clearToken();
      setAdmin(null);
    }
  };

  const login = (token: string, admin: Admin) => {
    saveToken(token);
    setAdmin(admin);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {}

    clearToken();
    setAdmin(null);
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthContext missing");
  }

  return context;
};
