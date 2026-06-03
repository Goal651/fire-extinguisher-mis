"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import toast from "react-hot-toast";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { getMe, updateProfile, changePassword } from "@/services/authService";

import { updateProfileSchema, UpdateProfileSchema } from "@/validations/profileSchema";
import { changePasswordSchema, ChangePasswordSchema } from "@/validations/profileSchema";

import { Admin } from "@/types";

export default function ProfilePage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getMe();
      setAdmin(response.data);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (admin) {
      resetProfile({
        name: admin.name,
        email: admin.email,
      });
    }
  }, [admin, resetProfile]);

  const onProfileUpdate = async (data: UpdateProfileSchema) => {
    try {
      await updateProfile(data.name, data.email);

      toast.success("Profile updated successfully");

      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const onPasswordChange = async (data: ChangePasswordSchema) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);

      toast.success("Password changed successfully");

      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100" style={{ color: "#666666" }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#2F2F2F" }}>
        Profile Settings
      </h1>

      <div className="flex gap-4 mb-6 border-b" style={{ borderColor: "#D2D2D2" }}>
        <button
          onClick={() => setActiveTab("profile")}
          className="pb-3 px-4 transition"
          style={{
            color: activeTab === "profile" ? "#2F2F2F" : "#666666",
            borderBottom: activeTab === "profile" ? "2px solid #2F2F2F" : "none",
          }}
        >
          Profile
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className="pb-3 px-4 transition"
          style={{
            color: activeTab === "password" ? "#2F2F2F" : "#666666",
            borderBottom: activeTab === "password" ? "2px solid #2F2F2F" : "none",
          }}
        >
          Change Password
        </button>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
          <Input
            label="Full Name"
            {...registerProfile("name")}
            error={profileErrors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            {...registerProfile("email")}
            error={profileErrors.email?.message}
          />

          <Button loading={isProfileSubmitting}>Update Profile</Button>
        </form>
      )}

      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
          <Input
            type="password"
            label="Current Password"
            {...registerPassword("currentPassword")}
            error={passwordErrors.currentPassword?.message}
          />

          <Input
            type="password"
            label="New Password"
            {...registerPassword("newPassword")}
            error={passwordErrors.newPassword?.message}
          />

          <Button loading={isPasswordSubmitting} variant="primary">
            Change Password
          </Button>
        </form>
      )}
    </div>
  );
}
