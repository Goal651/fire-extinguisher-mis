"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserX } from "lucide-react";
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

const ROLE_STYLES = {
  admin:     { bg: "#ffeaea", text: "#d32f2f" },
  inspector: { bg: "#eaf6ff", text: "#1976d2" },
  user:      { bg: "#f3f4f6", text: "#666666" },
};

export default function UsersPage() {
  const { admin } = useAuthContext();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user" | "inspector">("user");

  useEffect(() => {
    if (admin && admin.role !== "admin") router.push("/dashboard");
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

  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail("");
    setPassword(""); setRole("user"); setSelectedUser(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("All fields are required");
      return;
    }
    try {
      await userService.createUser({ firstName, lastName, email, password, role });
      toast.success("User created");
      setIsCreateOpen(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleEditInit = (user: UserItem) => {
    setSelectedUser(user);
    setFirstName(user.firstName); setLastName(user.lastName);
    setEmail(user.email); setRole(user.role); setPassword("");
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !firstName || !lastName || !email) {
      toast.error("Required fields cannot be empty");
      return;
    }
    try {
      await userService.updateUser(selectedUser._id, {
        firstName, lastName, email, role,
        ...(password ? { password } : {}),
      });
      toast.success("User updated");
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
      toast.success("User deleted");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2f2f2f" }}>Users</h1>
          <p className="text-sm mt-0.5" style={{ color: "#999" }}>
            Manage system accounts and roles.
          </p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          + Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          className="flex-1"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-select sm:w-44"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="inspector">Inspector</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-[#2f2f2f] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm" style={{ color: "#999" }}>Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#f4f4f4" }}
            >
              <UserX size={22} style={{ color: "#999" }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: "#2f2f2f" }}>No users found</p>
            <p className="text-xs" style={{ color: "#999" }}>
              {search || roleFilter ? "Try a different filter." : "Create your first user above."}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table px-5">
              <thead>
                <tr>
                  <th className="pl-5">Name</th>
                  <th className="hidden sm:table-cell">Email</th>
                  <th>Role</th>
                  <th className="hidden md:table-cell">Joined</th>
                  <th className="pr-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const rs = ROLE_STYLES[user.role];
                  return (
                    <tr key={user._id}>
                      <td className="pl-5">
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#2f2f2f" }}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs sm:hidden" style={{ color: "#999" }}>{user.email}</p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell text-sm" style={{ color: "#666" }}>
                        {user.email}
                      </td>
                      <td>
                        <span
                          className="px-2 py-1 text-[11px] font-semibold rounded-full capitalize"
                          style={{ backgroundColor: rs.bg, color: rs.text }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="hidden md:table-cell text-sm" style={{ color: "#666" }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="pr-5">
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => handleEditInit(user)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => handleDelete(user._id)}
                            style={{ color: "#d32f2f" }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <UserModal
        open={isCreateOpen}
        title="Add New User"
        onClose={() => { setIsCreateOpen(false); resetForm(); }}
        onSubmit={handleCreate}
        firstName={firstName} setFirstName={setFirstName}
        lastName={lastName} setLastName={setLastName}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        role={role} setRole={setRole}
        showPassword
        submitLabel="Create User"
      />

      {/* Edit Modal */}
      <UserModal
        open={isEditOpen}
        title="Edit User"
        onClose={() => { setIsEditOpen(false); resetForm(); }}
        onSubmit={handleUpdate}
        firstName={firstName} setFirstName={setFirstName}
        lastName={lastName} setLastName={setLastName}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        role={role} setRole={setRole}
        showPassword
        passwordHint="Leave blank to keep current password"
        submitLabel="Save Changes"
      />
    </div>
  );
}

// ── Shared user form modal ────────────────────────────────────────────────────

interface UserModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  role: "admin" | "user" | "inspector";
  setRole: (v: "admin" | "user" | "inspector") => void;
  showPassword?: boolean;
  passwordHint?: string;
  submitLabel?: string;
}

function UserModal({
  open, title, onClose, onSubmit,
  firstName, setFirstName, lastName, setLastName,
  email, setEmail, password, setPassword,
  role, setRole, showPassword, passwordHint, submitLabel = "Save",
}: UserModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl p-6 space-y-5"
        style={{ backgroundColor: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold" style={{ color: "#2f2f2f" }}>{title}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last Name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Input label="Email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {showPassword && (
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              hint={passwordHint}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: "#2f2f2f" }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="form-select"
            >
              <option value="user">User</option>
              <option value="inspector">Inspector</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
