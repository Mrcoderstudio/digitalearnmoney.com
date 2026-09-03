"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { UserShell } from "@/components/user/UserShell";
import {
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  amount: string;
  dailyProfit: string;
  duration: number;
  totalProfit: string;
  isActive: boolean;
}

function PlansContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [plansList, setPlansList] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<string | null>(null);

  const defaultPlans: PlanItem[] = [
  { id: "1", name: "Plan 1", amount: "300", dailyProfit: "50", duration: 10, totalProfit: "500", isActive: true },
  { id: "2", name: "Plan 2", amount: "775", dailyProfit: "70", duration: 15, totalProfit: "1050", isActive: true },
  { id: "3", name: "Plan 3", amount: "1600", dailyProfit: "100", duration: 20, totalProfit: "2000", isActive: true },
  { id: "4", name: "Plan 4", amount: "3475", dailyProfit: "150", duration: 30, totalProfit: "4500", isActive: true },
  { id: "5", name: "Plan 5", amount: "6775", dailyProfit: "200", duration: 40, totalProfit: "8000", isActive: true },
  { id: "6", name: "Plan 6", amount: "13275", dailyProfit: "400", duration: 40, totalProfit: "16000", isActive: true },
  { id: "7", name: "Plan 7", amount: "27375", dailyProfit: "500", duration: 60, totalProfit: "30000", isActive: true },
  { id: "8", name: "Plan 8", amount: "50300", dailyProfit: "1600", duration: 60, totalProfit: "60000", isActive: true },
  { id: "9", name: "Plan 9", amount: "80600", dailyProfit: "2000", duration: 60, totalProfit: "120000", isActive: true },
  { id: "10", name: "Plan 10", amount: "100000", dailyProfit: "3000", duration: 60, totalProfit: "180000", isActive: true },
];

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        let plans: PlanItem[] = [];
        if (data && data.plans && Array.isArray(data.plans)) {
          plans = data.plans;
        } else if (Array.isArray(data)) {
          plans = data;
        } else {
          plans = defaultPlans;
        }
        const uniquePlans = plans.filter(
          (plan, index, self) => index === self.findIndex((p) => p.id === plan.id)
        );
        setPlansList(uniquePlans);
        setLoading(false);
      })
      .catch(() => {
        setPlansList(defaultPlans);
        setLoading(false);
      });
  }, []);

  const plans = plansList.length > 0 ? plansList : defaultPlans;
  const uniquePlans = plans.filter(
    (plan, index, self) => index === self.findIndex((p) => p.id === plan.id)
  );

  const handleInvest = async (planId: string, planName: string) => {
    if (!session) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setInvesting(planId);
    try {
      const res = await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, planName }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "INSUFFICIENT_BALANCE") {
          toast.error(`💳 ${data.error}`);
          toast(
            (t) => (
              <div className="flex items-center gap-3">
                <span>{data.error}</span>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    router.push("/deposit");
                  }}
                  className="px-3 py-1 bg-[#00D4FF] text-[#0a1628] rounded-lg font-bold text-xs"
                >
                  Deposit Now
                </button>
              </div>
            ),
            { duration: 6000 }
          );
        } else {
          toast.error(data.error || "Failed to invest");
        }
        setInvesting(null);
        return;
      }

      toast.success(`🎉 ${data.message || planName + " activated successfully!"}`);
      if (data.remainingBalance !== undefined) {
        toast.success(`💰 Remaining balance: PKR ${data.remainingBalance.toLocaleString()}`);
      }

      setInvesting(null);
      await update();
      router.refresh();
    } catch (error) {
      console.error("❌ Investment error:", error);
      toast.error("Network error. Please try again.");
      setInvesting(null);
    }
  };

  if (loading) {
    return (
      <UserShell username={session?.user?.username || "User"}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-gray-400">Loading plans...</p>
          </div>
        </div>
      </UserShell>
    );
  }

  return (
    <UserShell username={session?.user?.username || "User"}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f213d] border border-[#00D4FF]/30 text-xs font-semibold text-[#00D4FF] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Investment Plans</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            High-Yield Investment Packages
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Select a package suited to your budget. Daily profits credit automatically every 24 hours into your account balance with minimum withdrawal of 30 PKR.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniquePlans.map((plan, idx) => {
            const isPopular = idx === 2 || idx === 3;
            const isVip = idx === 9;
            const amountNum = Number(plan.amount);
            const dailyNum = Number(plan.dailyProfit);
            const totalNum = Number(plan.totalProfit);
            const returnPct = Math.round((totalNum / amountNum) * 100);
            const isInvesting = investing === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  isPopular
                    ? "bg-gradient-to-b from-[#132a4e] to-[#0f213d] border-2 border-[#00D4FF] shadow-2xl shadow-cyan-500/15 scale-[1.02]"
                    : isVip
                    ? "bg-gradient-to-b from-[#1c2c48] to-[#0f213d] border-2 border-[#FFD700] shadow-2xl shadow-amber-500/15"
                    : "bg-[#0f213d] border border-[#1e3a66] hover:border-[#00D4FF]/40"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00D4FF] text-[#0a1628] font-black text-[11px] px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </div>
                )}
                {isVip && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#0a1628] font-black text-[11px] px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    High Yield VIP
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                      {returnPct}% Total ROI
                    </span>
                  </div>
                  <div className="mt-4 pb-4 border-b border-[#1e3a66]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        PKR {amountNum.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      One-time Investment ({plan.duration} Days)
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#00D4FF]" /> Daily Profit:
                      </span>
                      <span className="font-bold text-[#00D4FF]">
                        PKR {dailyNum.toLocaleString()} / day
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#FFD700]" /> Total Return:
                      </span>
                      <span className="font-bold text-[#FFD700]">
                        PKR {totalNum.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" /> Duration:
                      </span>
                      <span className="font-semibold text-white">{plan.duration} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-400" /> Min Withdrawal:
                      </span>
                      <span className="font-semibold text-white">30 PKR</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    onClick={() => handleInvest(plan.id, plan.name)}
                    disabled={isInvesting}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isInvesting
                        ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                        : isPopular
                        ? "bg-[#00D4FF] text-[#0a1628] hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
                        : isVip
                        ? "bg-[#FFD700] text-[#0a1628] hover:bg-amber-300 shadow-md shadow-amber-500/20"
                        : "bg-[#132a4e] hover:bg-[#00D4FF]/20 text-white border border-[#1e3a66] hover:border-[#00D4FF]/40"
                    }`}
                  >
                    {isInvesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{session ? "Invest Now" : "Get Started"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl bg-[#0f213d] border border-[#1e3a66] p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white">Plans Comparison Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a1628] text-slate-400 border-b border-[#1e3a66]">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Deposit Amount</th>
                  <th className="py-3 px-4">Daily Return</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Return</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a66]/60 text-slate-200">
                {uniquePlans.map((p) => {
                  const isInvesting = investing === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-[#132a4e]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3.5 px-4 font-bold text-[#00D4FF]">PKR {Number(p.amount).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-400">PKR {Number(p.dailyProfit).toLocaleString()} / day</td>
                      <td className="py-3.5 px-4">{p.duration} Days</td>
                      <td className="py-3.5 px-4 font-bold text-[#FFD700]">PKR {Number(p.totalProfit).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleInvest(p.id, p.name)}
                          disabled={isInvesting}
                          className="inline-block px-3.5 py-1.5 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF] hover:text-[#0a1628] border border-[#00D4FF]/30 font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isInvesting ? "..." : (session ? "Invest" : "Sign Up")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UserShell>
  );
}

export default function PlansPage() {
  return <PlansContent />;
}
