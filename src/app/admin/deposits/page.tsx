"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface Deposit {
  id: string;
  userId: string;
  amount: string;
  screenshot: string;
  paymentMethod: string | null;
  status: string;
  adminNote: string | null;
  approvedAt: string | null;
  createdAt: string;
  username: string | null;
  email: string | null;
  planName: string | null;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showScreenshot, setShowScreenshot] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      const res = await fetch("/api/admin/deposits");
      const data = await res.json();
      setDeposits(data);
    } catch (err) {
      toast.error("Failed to load deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (depositId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this deposit?`)) return;

    setActionLoading(depositId);
    try {
      const res = await fetch("/api/admin/deposit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId, status }),
      });

      if (res.ok) {
        toast.success(`Deposit ${status}ed successfully!`);
        fetchDeposits();
      } else {
        toast.error("Failed to update deposit");
      }
    } catch (err) {
      toast.error("Error updating deposit");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = deposits.filter((d) => d.status === "pending").length;

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading deposits...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Deposits</h1>
        <span className="text-sm text-yellow-500">
          Pending: {pendingCount}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1e3a66] bg-[#0f213d]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e3a66]">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">User</th>
              <th className="px-4 py-3 text-left text-slate-400">Plan</th>
              <th className="px-4 py-3 text-left text-slate-400">Amount</th>
              <th className="px-4 py-3 text-left text-slate-400">Method</th>
              <th className="px-4 py-3 text-left text-slate-400">Proof</th>
              <th className="px-4 py-3 text-left text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {deposits.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No deposits found.
                </td>
              </tr>
            ) : (
              deposits.map((deposit) => (
                <tr key={deposit.id} className="border-b border-[#1e3a66]/50 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="text-white">{deposit.username || "Unknown"}</p>
                    <p className="text-xs text-slate-400">{deposit.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{deposit.planName || "—"}</td>
                  <td className="px-4 py-3 text-[#00D4FF]">
                    {Number(deposit.amount).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-400">
                      {deposit.paymentMethod || "Easypaisa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {deposit.screenshot && (
                      <button
                        onClick={() => setShowScreenshot(showScreenshot === deposit.id ? null : deposit.id)}
                        className="text-xs text-[#00D4FF] hover:underline"
                      >
                        {showScreenshot === deposit.id ? "Hide" : "View"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      deposit.status === "approved"
                        ? "bg-green-500/20 text-green-500"
                        : deposit.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {formatDistanceToNow(new Date(deposit.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    {deposit.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(deposit.id, "approved")}
                          disabled={actionLoading === deposit.id}
                          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(deposit.id, "rejected")}
                          disabled={actionLoading === deposit.id}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Screenshot Modal */}
      {showScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowScreenshot(null)}>
          <div className="max-w-2xl w-full bg-[#0f213d] rounded-xl border border-[#1e3a66] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">Payment Screenshot</h3>
              <button onClick={() => setShowScreenshot(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <img
              src={deposits.find(d => d.id === showScreenshot)?.screenshot || ""}
              alt="Screenshot"
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}