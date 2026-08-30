"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface Withdrawal {
  id: string;
  userId: string;
  amount: string;
  method: string;
  accountDetails: any;
  status: string;
  adminNote: string | null;
  processedAt: string | null;
  createdAt: string;
  username: string | null;
  email: string | null;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch("/api/admin/withdrawals");
      const data = await res.json();
      setWithdrawals(data);
    } catch (err) {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (withdrawalId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this withdrawal?`)) return;

    setActionLoading(withdrawalId);
    try {
      const res = await fetch("/api/admin/withdrawal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, status }),
      });

      if (res.ok) {
        toast.success(`Withdrawal ${status}ed successfully!`);
        fetchWithdrawals();
      } else {
        toast.error("Failed to update withdrawal");
      }
    } catch (err) {
      toast.error("Error updating withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading withdrawals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Withdrawals</h1>
        <span className="text-sm text-yellow-500">
          Pending: {pendingCount}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1e3a66] bg-[#0f213d]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e3a66]">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">User</th>
              <th className="px-4 py-3 text-left text-slate-400">Amount</th>
              <th className="px-4 py-3 text-left text-slate-400">Method</th>
              <th className="px-4 py-3 text-left text-slate-400">Account</th>
              <th className="px-4 py-3 text-left text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No withdrawals found.
                </td>
              </tr>
            ) : (
              withdrawals.map((withdrawal) => {
                const details = withdrawal.accountDetails || {};
                return (
                  <tr key={withdrawal.id} className="border-b border-[#1e3a66]/50 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="text-white">{withdrawal.username || "Unknown"}</p>
                      <p className="text-xs text-slate-400">{withdrawal.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[#00D4FF]">
                      {Number(withdrawal.amount).toFixed(0)} PKR
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs font-semibold text-purple-400">
                        {withdrawal.method || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setShowDetails(showDetails === withdrawal.id ? null : withdrawal.id)}
                        className="text-xs text-[#00D4FF] hover:underline"
                      >
                        {showDetails === withdrawal.id ? "Hide" : "View"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        withdrawal.status === "completed"
                          ? "bg-green-500/20 text-green-500"
                          : withdrawal.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(withdrawal.id, "completed")}
                            disabled={actionLoading === withdrawal.id}
                            className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(withdrawal.id, "rejected")}
                            disabled={actionLoading === withdrawal.id}
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Account Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowDetails(null)}>
          <div className="max-w-md w-full bg-[#0f213d] rounded-xl border border-[#1e3a66] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Account Details</h3>
              <button onClick={() => setShowDetails(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {withdrawals.find(w => w.id === showDetails) && (
              <div className="space-y-2 text-sm">
                {Object.entries(withdrawals.find(w => w.id === showDetails)!.accountDetails || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-[#1e3a66]/50 py-1">
                    <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-white font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}