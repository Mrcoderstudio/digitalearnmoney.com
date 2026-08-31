"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { Eye, CheckCircle, XCircle, Clock, User, Mail, Wallet } from "lucide-react";

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
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

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

  const handleAction = async (withdrawalId: string, status: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to ${status} this withdrawal?`)) return;

    setActionLoading(withdrawalId);
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Withdrawal ${status} successfully!`);
        fetchWithdrawals();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update withdrawal");
      }
    } catch (err) {
      toast.error("Error updating withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;

  // Format account details nicely
  const formatAccountDetails = (details: any) => {
    if (!details) return "—";
    if (typeof details === "string") return details;
    if (typeof details === "object") {
      const parts = [];
      if (details.accountHolder) parts.push(`👤 ${details.accountHolder}`);
      if (details.accountNumber) parts.push(`📱 ${details.accountNumber}`);
      if (details.bankName) parts.push(`🏦 ${details.bankName}`);
      return parts.join(" | ") || "—";
    }
    return "—";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"><Clock className="w-3 h-3" /> Pending</span>;
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="text-slate-400">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-slate-400">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
          <p className="text-sm text-slate-400">Manage all user withdrawal requests</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30">
            Pending: {pendingCount}
          </span>
          <button
            onClick={fetchWithdrawals}
            className="px-3 py-1.5 text-xs bg-[#132a4e] text-slate-300 rounded-lg hover:bg-[#1e3a66] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1e3a66] bg-[#0f213d]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e3a66] bg-[#0a1628]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Requested</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e3a66]/50">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No withdrawal requests found.
                </td>
              </tr>
            ) : (
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-[#132a4e]/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{withdrawal.username || "Unknown"}</span>
                      <span className="text-xs text-slate-400">{withdrawal.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#00D4FF]">
                    PKR {Number(withdrawal.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/30">
                      {withdrawal.method || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 truncate text-xs">
                        {formatAccountDetails(withdrawal.accountDetails)}
                      </span>
                      <button
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        className="p-1 rounded-lg hover:bg-[#1e3a66] transition-colors text-slate-400 hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {withdrawal.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(withdrawal.id, "approved")}
                          disabled={actionLoading === withdrawal.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          {actionLoading === withdrawal.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(withdrawal.id, "rejected")}
                          disabled={actionLoading === withdrawal.id}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for full account details */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedWithdrawal(null)}>
          <div className="max-w-md w-full bg-[#0f213d] rounded-xl border border-[#1e3a66] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Account Details</h3>
              <button onClick={() => setSelectedWithdrawal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1e3a66] transition-colors">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <User className="w-4 h-4" />
                <span className="font-medium text-white">{selectedWithdrawal.username || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <span className="text-white">{selectedWithdrawal.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Wallet className="w-4 h-4" />
                <span className="text-[#00D4FF] font-bold">PKR {Number(selectedWithdrawal.amount).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-[#1e3a66]">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Account Details</p>
                <div className="bg-[#0a1628] rounded-lg p-3 space-y-1 text-sm">
                  {typeof selectedWithdrawal.accountDetails === "object" && selectedWithdrawal.accountDetails !== null ? (
                    Object.entries(selectedWithdrawal.accountDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-[#1e3a66]/30 last:border-0">
                        <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-white font-medium">{value as string}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">{selectedWithdrawal.accountDetails || "No details"}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="px-4 py-2 rounded-lg bg-[#132a4e] text-white text-sm hover:bg-[#1e3a66] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
