"use client";

import { useEffect, useState } from "react";

interface AdminDTO {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  active: boolean;
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<AdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/superadmin/admins");
    setAdmins(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/superadmin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to add admin");
      return;
    }
    setName("");
    setEmail("");
    setRole("ADMIN");
    await load();
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this admin's access?")) return;
    await fetch(`/api/superadmin/admins/${id}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <p className="text-gray-500">Loading admins…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-nixon-maroon">Manage Admins</h1>

      <form onSubmit={addAdmin} className="rounded-lg border border-nixon-maroon/20 p-4 space-y-3">
        <h2 className="font-semibold">Add or Promote an Admin</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Email (must be a Google Workspace account)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="rounded-md bg-nixon-maroon px-4 py-2 text-sm font-medium text-white hover:bg-nixon-maroon-dark"
        >
          Save
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} className="border-b border-gray-100">
              <td className="py-2">{admin.name}</td>
              <td>{admin.email}</td>
              <td>{admin.role}</td>
              <td>{admin.active ? "Active" : "Revoked"}</td>
              <td>
                {admin.active && (
                  <button
                    onClick={() => revoke(admin.id)}
                    className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
