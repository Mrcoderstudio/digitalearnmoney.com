"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  username: string;
  email: string;
  balance: string;
  totalInvested: string;
  totalEarned: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    if (!confirm(`Are you sure you want to ${newStatus} this user?`)) return;

    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`User ${newStatus}ed successfully!`);
        fetchUsers();
      } else {
        toast.error("Failed to update user");
      }
    } catch (err) {
      toast.error("Error updating user");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        <span className="text-sm text-slate-400">Total: {users.length} users</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1e3a66] bg-[#0f213d]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e3a66]">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">Username</th>
              <th className="px-4 py-3 text-left text-slate-400">Email</th>
              <th className="px-4 py-3 text-left text-slate-400">Balance</th>
              <th className="px-4 py-3 text-left text-slate-400">Invested</th>
              <th className="px-4 py-3 text-left text-slate-400">Role</th>
              <th className="px-4 py-3 text-left text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-slate-400">Joined</th>
              <th className="px-4 py-3 text-left text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-[#1e3a66]/50 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{user.username}</td>
                  <td className="px-4 py-3 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3 text-[#00D4FF]">
                    {Number(user.balance).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {Number(user.totalInvested).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-blue-500/20 text-blue-500"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        disabled={actionLoading === user.id}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold text-white transition ${
                          user.status === "active"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        } disabled:opacity-50`}
                      >
                        {actionLoading === user.id
                          ? "Loading..."
                          : user.status === "active"
                          ? "Suspend"
                          : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}