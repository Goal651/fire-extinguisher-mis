"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { userService } from "@/services/userService";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user" | "inspector";
  createdAt: string;
}

export default function UsersPage() {
  const { admin } = useAuthContext();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user" | "inspector">("user");

  useEffect(() => {
    if (admin && admin.role !== "admin") {
      router.push("/dashboard");
    }
  }, [admin, router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers(search, roleFilter);
      setUsers(response.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      await userService.createUser({ firstName, lastName, email, password, role });
      toast.success("User created successfully");
      setIsCreateOpen(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleEditInit = (user: UserItem) => {
    setSelectedUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!firstName || !lastName || !email) {
      toast.error("Required fields cannot be empty");
      return;
    }

    try {
      await userService.updateUser(selectedUser._id, {
        firstName,
        lastName,
        email,
        role,
        ...(password ? { password } : {}),
      });
      toast.success("User updated successfully");
      setIsEditOpen(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
            Users Management
          </h1>
          <p className="text-sm" style={{ color: "#666666" }}>
            Create and manage system users, admins, and inspectors.
          </p>
        </div>

        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#D2D2D2",
              color: "#2F2F2F",
            }}
          >
            <option value="">Filter by Role (All)</option>
            <option value="admin">Admin</option>
            <option value="inspector">Inspector</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-auto">
        {loading ? (
          <div className="text-center py-8" style={{ color: "#666666" }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8" style={{ color: "#666666" }}>
            No users found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "#D2D2D2" }}>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Name</th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Email</th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Role</th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Created At</th>
                <th className="pb-3" style={{ color: "#2F2F2F" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition"
                  style={{ borderColor: "#D2D2D2" }}
                >
                  <td className="py-4" style={{ color: "#2F2F2F" }}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td style={{ color: "#666666" }}>{user.email}</td>
                  <td>
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor:
                          user.role === "admin"
                            ? "#FFEAEA"
                            : user.role === "inspector"
                            ? "#EAF6FF"
                            : "#F3F4F6",
                        color:
                          user.role === "admin"
                            ? "#D32F2F"
                            : user.role === "inspector"
                            ? "#1976D2"
                            : "#666666",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: "#666666" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditInit(user)}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(user._id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold" style={{ color: "#2F2F2F" }}>
              Add New User
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="First Name"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last Name"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#2F2F2F" }}>
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#D2D2D2",
                    color: "#2F2F2F",
                  }}
                >
                  <option value="user">User</option>
                  <option value="inspector">Inspector</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save User</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold" style={{ color: "#2F2F2F" }}>
              Edit User details
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="First Name"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last Name"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password (leave blank to keep unchanged)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#2F2F2F" }}>
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#D2D2D2",
                    color: "#2F2F2F",
                  }}
                >
                  <option value="user">User</option>
                  <option value="inspector">Inspector</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
