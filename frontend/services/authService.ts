import api from "@/lib/axios";
import { UserRegistration } from "@/types";

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post("/auth/verify-otp", {
    email,
    otp,
  });

  return response.data;
};

export const resendOtp = async (email: string) => {
  const response = await api.post("/auth/resend-otp", {
    email,
  });

  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

export const register = async (data: UserRegistration) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/auth/reset-password", {
    token,
    password,
  });

  return response.data;
};

export const updateProfile = async (name: string, email: string) => {
  const response = await api.put("/auth/update-profile", {
    name,
    email,
  });

  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  const response = await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });

  return response.data;
};
