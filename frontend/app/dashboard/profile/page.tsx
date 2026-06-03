"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getMe, updateProfile, changePassword } from "@/services/authService";
import {
  updateProfileSchema, UpdateProfileSchema,
  changePasswordSchema, ChangePasswordSchema,
} from "@/validations/profileSchema";
import { Admin, User } from "@/types";

type Tab = "profile" | "password";

export default function ProfilePage() {
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");

  const loadProfile = async () => {
    try {
      const r = await getMe();
      setAdmin(r.data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const profileForm = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
  });

  const passwordForm = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (admin) profileForm.reset({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email
    });
  }, [admin]);

  const onProfileUpdate = async (data: UpdateProfileSchema) => {
    try {
      await updateProfile(data.firstName, data.lastName, data.email);
      toast.success("Profile updated");
      loadProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const onPasswordChange = async (data: ChangePasswordSchema) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed");
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Change failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40 gap-3">
        <div className="w-6 h-6 border-2 border-[#2f2f2f] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm" style={{ color: "#999" }}>Loading…</span>
      </div>
    );
  }

  const displayName = admin?.name || `${admin?.firstName ?? ""} ${admin?.lastName ?? ""}`.trim();
  const initials = (displayName || admin?.email || "?")[0].toUpperCase();

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold" style={{ color: "#2f2f2f" }}>Profile</h1>

      {/* Avatar card */}
      <div className="card flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: "#2f2f2f", color: "#fff" }}
        >
          {initials}
        </div>
        <div>
          <p className="font-semibold" style={{ color: "#2f2f2f" }}>{displayName || admin?.email}</p>
          <p className="text-sm capitalize" style={{ color: "#999" }}>{admin?.role}</p>
          <p className="text-sm" style={{ color: "#666" }}>{admin?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card space-y-5">
        <div className="flex border-b" style={{ borderColor: "#d2d2d2" }}>
          {(["profile", "password"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 pb-3 text-sm font-medium capitalize transition"
              style={{
                color: tab === t ? "#2f2f2f" : "#999",
                borderBottom: tab === t ? "2px solid #2f2f2f" : "2px solid transparent",
              }}
            >
              {t === "profile" ? "Edit Profile" : "Change Password"}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <form onSubmit={profileForm.handleSubmit(onProfileUpdate)} className="space-y-4">
            <Input
              label="First Name"
              placeholder="Your first name"
              {...profileForm.register("firstName")}
              error={profileForm.formState.errors.firstName?.message}
            />
            <Input
              label="Last Name"
              placeholder="Your last name"
              {...profileForm.register("lastName")}
              error={profileForm.formState.errors.lastName?.message}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...profileForm.register("email")}
              error={profileForm.formState.errors.email?.message}
            />
            <Button loading={profileForm.formState.isSubmitting} size="sm">
              Save Changes
            </Button>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              placeholder="••••••••"
              {...passwordForm.register("currentPassword")}
              error={passwordForm.formState.errors.currentPassword?.message}
            />
            <Input
              type="password"
              label="New Password"
              placeholder="••••••••"
              {...passwordForm.register("newPassword")}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            <Button loading={passwordForm.formState.isSubmitting} size="sm">
              Change Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
