"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Plan {
  id: string;
  name: string;
  amount: string;
  dailyProfit: string;
  duration: number;
  totalProfit: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (!confirm(`Are you sure you want to ${newStatus ? "activate" : "deactivate"} this plan?`)) return;

    setActionLoading(planId);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, isActive: newStatus }),
      });

      if (res.ok) {
        toast.success(`Plan ${newStatus ? "activated" : "deactivated"} successfully!`);
        fetchPlans();
      } else {
        toast.error("Failed to update plan");
      }
    } catch (err) {
      toast.error("Error updating plan");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Plans</h1>
        <span className="text-sm text-slate-400">Total: {plans.length} plans</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1e3a66] bg-[#0f213d]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e3a66]">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">#</th>
              <th className="px-4 py-3 text-left text-slate-400">Plan Name</th>
              <th className="px-4 py-3 text-left text-slate-400">Amount</th>
              <th className="px-4 py-3 text-left text-slate-400">Daily Profit</th>
              <th className="px-4 py-3 text-left text-slate-400">Duration</th>
              <th className="px-4 py-3 text-left text-slate-400">Total Return</th>
              <th className="px-4 py-3 text-left text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No plans found.
                </td>
              </tr>
            ) : (
              plans.map((plan, index) => (
                <tr key={plan.id} className="border-b border-[#1e3a66]/50 hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                  <td className="px-4 py-3 text-white font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-[#00D4FF]">
                    {Number(plan.amount).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3 text-green-500">
                    {Number(plan.dailyProfit).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3 text-slate-300">{plan.duration} days</td>
                  <td className="px-4 py-3 text-yellow-500">
                    {Number(plan.totalProfit).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      plan.isActive
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(plan.id, plan.isActive)}
                      disabled={actionLoading === plan.id}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold text-white transition ${
                        plan.isActive
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      } disabled:opacity-50`}
                    >
                      {actionLoading === plan.id
                        ? "Loading..."
                        : plan.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
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