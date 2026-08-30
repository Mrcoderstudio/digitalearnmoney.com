"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserShell } from "@/components/user/UserShell";
import {
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
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
  const { data: session } = useSession();
  const [plansList, setPlansList] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.plans && Array.isArray(data.plans)) {
          const uniquePlans = data.plans.filter(
            (plan: PlanItem, index: number, self: PlanItem[]) =>
              index === self.findIndex((p) => p.id === plan.id)
          );
          setPlansList(uniquePlans);
        } else if (Array.isArray(data)) {
          const uniquePlans = data.filter(
            (plan: PlanItem, index: number, self: PlanItem[]) =>
              index === self.findIndex((p) => p.id === plan.id)
          );
          setPlansList(uniquePlans);
        } else {
          setPlansList(defaultPlans);
        }
        setLoading(false);
      })
      .catch(() => {
        setPlansList(defaultPlans);
        setLoading(false);
      });
  }, []);

  // ✅ 10 Plans (150 to 10000)
  const defaultPlans: PlanItem[] = [
    { id: "1", name: "Plan 1", amount: "150", dailyProfit: "30", duration: 10, totalProfit: "300", isActive: true },
    { id: "2", name: "Plan 2", amount: "350", dailyProfit: "50", duration: 15, totalProfit: "750", isActive: true },
    { id: "3", name: "Plan 3", amount: "640", dailyProfit: "80", duration: 30, totalProfit: "2400", isActive: true },
    { id: "4", name: "Plan 4", amount: "940", dailyProfit: "120", duration: 30, totalProfit: "3600", isActive: true },
    { id: "5", name: "Plan 5", amount: "1700", dailyProfit: "300", duration: 30, totalProfit: "9000", isActive: true },
    { id: "6", name: "Plan 6", amount: "3000", dailyProfit: "600", duration: 30, totalProfit: "18000", isActive: true },
    { id: "7", name: "Plan 7", amount: "4000", dailyProfit: "740", duration: 30, totalProfit: "22200", isActive: true },
    { id: "8", name: "Plan 8", amount: "5000", dailyProfit: "900", duration: 40, totalProfit: "36000", isActive: true },
    { id: "9", name: "Plan 9", amount: "8000", dailyProfit: "1700", duration: 90, totalProfit: "153000", isActive: true },
    { id: "10", name: "Plan 10", amount: "10000", dailyProfit: "2400", duration: 90, totalProfit: "216000", isActive: true },
  ];

  const plans = plansList.length > 0 ? plansList : defaultPlans;

  const uniquePlans = plans.filter(
    (plan, index, self) => index === self.findIndex((p) => p.id === plan.id)
  );

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

  const content = (
    <div className="space-y-8">
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
                <Link
                  href={session ? `/deposit?planId=${plan.id}` : "/register"}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isPopular
                      ? "bg-[#00D4FF] text-[#0a1628] hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
                      : isVip
                      ? "bg-[#FFD700] text-[#0a1628] hover:bg-amber-300 shadow-md shadow-amber-500/20"
                      : "bg-[#132a4e] hover:bg-[#00D4FF]/20 text-white border border-[#1e3a66] hover:border-[#00D4FF]/40"
                  }`}
                >
                  <span>{session ? "Invest Now" : "Get Started"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
              {uniquePlans.map((p) => (
                <tr key={p.id} className="hover:bg-[#132a4e]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                  <td className="py-3.5 px-4 font-bold text-[#00D4FF]">PKR {Number(p.amount).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-400">PKR {Number(p.dailyProfit).toLocaleString()} / day</td>
                  <td className="py-3.5 px-4">{p.duration} Days</td>
                  <td className="py-3.5 px-4 font-bold text-[#FFD700]">PKR {Number(p.totalProfit).toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={session ? `/deposit?planId=${p.id}` : "/register"}
                      className="inline-block px-3.5 py-1.5 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF] hover:text-[#0a1628] border border-[#00D4FF]/30 font-bold text-xs transition-colors"
                    >
                      {session ? "Invest" : "Sign Up"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ✅ Wrap with UserShell for sidebar (no top navbar)
  return <UserShell username={session?.user?.username || "User"}>{content}</UserShell>;
}

export default function PlansPage() {
  return <PlansContent />;
}