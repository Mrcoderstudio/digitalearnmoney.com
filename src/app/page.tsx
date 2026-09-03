"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  Calculator,
  ArrowDownCircle,
  ArrowUpCircle,
  MessageCircle,
  Sparkles,
  Award,
  ChevronDown,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  amount: string;
  dailyProfit: string;
  duration: number;
  totalProfit: string;
}

export default function LandingPage() {
  const [plansList, setPlansList] = useState<PlanItem[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) {
          setPlansList(data.plans);
        }
      })
      .catch(() => {});
  }, []);

  // ✅ Updated default plans (client's rates: 300 to 100,000)
  const defaultPlans: PlanItem[] = [
    { id: "1", name: "Plan 1", amount: "300", dailyProfit: "50", duration: 10, totalProfit: "500" },
    { id: "2", name: "Plan 2", amount: "775", dailyProfit: "70", duration: 15, totalProfit: "1050" },
    { id: "3", name: "Plan 3", amount: "1600", dailyProfit: "100", duration: 20, totalProfit: "2000" },
    { id: "4", name: "Plan 4", amount: "3475", dailyProfit: "150", duration: 30, totalProfit: "4500" },
    { id: "5", name: "Plan 5", amount: "6775", dailyProfit: "200", duration: 40, totalProfit: "8000" },
    { id: "6", name: "Plan 6", amount: "13275", dailyProfit: "400", duration: 40, totalProfit: "16000" },
    { id: "7", name: "Plan 7", amount: "27375", dailyProfit: "500", duration: 60, totalProfit: "30000" },
    { id: "8", name: "Plan 8", amount: "50300", dailyProfit: "1600", duration: 60, totalProfit: "60000" },
    { id: "9", name: "Plan 9", amount: "80600", dailyProfit: "2000", duration: 60, totalProfit: "120000" },
    { id: "10", name: "Plan 10", amount: "100000", dailyProfit: "3000", duration: 60, totalProfit: "180000" },
  ];

  const activePlans = plansList.length > 0 ? plansList : defaultPlans;
  const currentCalcPlan = activePlans[selectedPlanIndex] || activePlans[0];

  // ✅ Updated FAQ (with new min values)
  const faqs = [
    {
      q: "How does Digital Earn Money work?",
      a: "Select an investment package starting from 300 PKR. Once your deposit is confirmed via Easypaisa, your plan runs for its duration. Daily profits are credited automatically to your wallet every 24 hours.",
    },
    {
      q: "What is the minimum deposit and withdrawal limit?",
      a: "The minimum deposit is 300 PKR (Plan 1). The minimum withdrawal limit is 100 PKR. You can withdraw your earnings directly to your Easypaisa account.",
    },
    {
      q: "How does the referral commission system work?",
      a: "You earn a 10% direct commission (Level 1) whenever someone registers with your link and activates a plan. When your team members invite others (Level 2), you receive an extra 2% commission automatically!",
    },
    {
      q: "How long does it take for withdrawals to arrive?",
      a: "Withdrawal requests are processed promptly by our administrative financial team usually within 15 to 60 minutes after submission.",
    },
    {
      q: "Can I activate multiple plans simultaneously?",
      a: "Yes! You can invest in multiple packages at the same time. Each plan will generate daily profits independently to your balance.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100 flex flex-col selection:bg-[#00D4FF]/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-[#1e3a66]/50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-[#00D4FF]/10 to-amber-500/10 blur-[130px] -z-10 pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f213d] border border-[#00D4FF]/30 text-xs font-semibold text-[#00D4FF] mb-6 shadow-sm shadow-cyan-500/20 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Pakistan&apos;s Most Trusted Daily Profit Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Invest Smart, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-cyan-300 to-[#FFD700]">
              Earn Daily Profits
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Start earning with packages starting from only <strong className="text-white">300 PKR</strong>.
            Receive automated daily income credited directly into your account with instant withdrawals to Easypaisa.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-400 text-[#0a1628] font-bold text-sm shadow-lg shadow-cyan-500/30 hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#plans"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0f213d] border border-[#1e3a66] hover:border-[#00D4FF]/50 text-white font-semibold text-sm hover:bg-[#132a4e] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Plans</span>
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#0f213d]/80 border border-[#1e3a66] backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-white">300 PKR</p>
              <p className="text-xs text-slate-400 mt-1">Starting Investment</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f213d]/80 border border-[#1e3a66] backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-[#00D4FF]">100 PKR</p>
              <p className="text-xs text-slate-400 mt-1">Min. Withdrawal</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f213d]/80 border border-[#1e3a66] backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-[#FFD700]">10%</p>
              <p className="text-xs text-slate-400 mt-1">Referral Bonus</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f213d]/80 border border-[#1e3a66] backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">24/7</p>
              <p className="text-xs text-slate-400 mt-1">Auto Earnings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Investment Packages
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Choose Your Profit Plan
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            All plans run for their respective durations with daily earnings credited automatically every 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlans.map((plan, idx) => {
            const isPopular = idx === 2 || idx === 3;
            const isVip = idx >= 7;
            const amountNum = Number(plan.amount);
            const dailyNum = Number(plan.dailyProfit);
            const totalNum = Number(plan.totalProfit);
            const returnPct = Math.round((totalNum / amountNum) * 100);

            return (
              <div
                key={plan.id || idx}
                className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  isPopular
                    ? "bg-gradient-to-b from-[#132a4e] to-[#0f213d] border-2 border-[#00D4FF] shadow-xl shadow-cyan-500/10 scale-[1.02]"
                    : isVip
                    ? "bg-gradient-to-b from-[#1b2b46] to-[#0f213d] border-2 border-[#FFD700] shadow-xl shadow-amber-500/10"
                    : "bg-[#0f213d]/70 border border-[#1e3a66] hover:border-[#00D4FF]/50"
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
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                      {returnPct}% Total ROI
                    </span>
                  </div>

                  <div className="mt-4 pb-4 border-b border-[#1e3a66]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        PKR {Number(plan.amount).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">One-time Deposit</span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#00D4FF]" /> Daily Profit:
                      </span>
                      <span className="font-bold text-[#00D4FF]">
                        PKR {Number(plan.dailyProfit).toLocaleString()} / day
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#FFD700]" /> Total Return:
                      </span>
                      <span className="font-bold text-[#FFD700]">
                        PKR {Number(plan.totalProfit).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Duration:
                      </span>
                      <span className="font-semibold text-slate-200">{plan.duration} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-cyan-400" /> Min. Withdrawal:
                      </span>
                      <span className="font-semibold text-slate-200">100 PKR</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <Link
                    href={`/deposit?planId=${plan.id}`}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isPopular
                        ? "bg-[#00D4FF] text-[#0a1628] hover:bg-cyan-300 shadow-md shadow-cyan-500/30"
                        : isVip
                        ? "bg-[#FFD700] text-[#0a1628] hover:bg-amber-300 shadow-md shadow-amber-500/30"
                        : "bg-[#132a4e] hover:bg-[#00D4FF]/20 text-white border border-[#1e3a66] hover:border-[#00D4FF]/40"
                    }`}
                  >
                    <span>Invest Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Profit Calculator */}
      <section className="py-16 bg-[#070e1a]/80 border-y border-[#1e3a66]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#0f213d] to-[#132a4e] border border-[#1e3a66] p-6 sm:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00D4FF] flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Interactive Profit Calculator</h3>
                <p className="text-xs text-slate-400">Select any plan to estimate your exact returns</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-8">
              {activePlans.slice(0, 10).map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanIndex(idx)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    selectedPlanIndex === idx
                      ? "bg-[#00D4FF] text-[#0a1628] border-[#00D4FF] shadow-md shadow-cyan-500/20"
                      : "bg-[#0a1628] text-slate-300 border-[#1e3a66] hover:border-slate-500"
                  }`}
                >
                  <div>{p.name}</div>
                  <div className="text-[10px] opacity-80">{Number(p.amount)} PKR</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-2xl bg-[#0a1628]/80 border border-[#1e3a66]">
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-400 font-medium">Daily Guaranteed Profit</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#00D4FF] mt-1">
                  PKR {Number(currentCalcPlan.dailyProfit).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Credited every 24 hours</p>
              </div>
              <div className="text-center sm:text-left border-y sm:border-y-0 sm:border-x border-[#1e3a66] py-3 sm:py-0 sm:px-4">
                <p className="text-xs text-slate-400 font-medium">Total Return (Duration)</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#FFD700] mt-1">
                  PKR {Number(currentCalcPlan.totalProfit).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Principal + Total Earnings</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-400 font-medium">Net Profit Amount</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                  + PKR {(Number(currentCalcPlan.totalProfit) - Number(currentCalcPlan.amount)).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Pure profit generated</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 text-center sm:text-left">
                Ready to activate <strong className="text-white">{currentCalcPlan.name}</strong> for{" "}
                <strong className="text-[#00D4FF]">{Number(currentCalcPlan.amount)} PKR</strong>?
              </p>
              <Link
                href={`/deposit?planId=${currentCalcPlan.id}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-400 text-[#0a1628] font-bold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all text-center"
              >
                Deposit &amp; Activate Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF] bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Quick &amp; Easy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Start Earning in 3 Simple Steps
          </h2>
          <p className="text-slate-400 text-sm mt-2">No complicated procedures. Instant onboarding designed for everyone.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-[#0f213d] border border-[#1e3a66] relative">
            <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/20 text-[#00D4FF] font-black text-xl flex items-center justify-center mb-5">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create an Account</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Register in 30 seconds with your username, email, and password. Optional referral code to join your team.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f213d] border border-[#1e3a66] relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/20 text-[#FFD700] font-black text-xl flex items-center justify-center mb-5">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Choose Plan &amp; Deposit</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Send the exact plan amount via Easypaisa. Upload the transaction receipt screenshot.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f213d] border border-[#1e3a66] relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center mb-5">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Earn &amp; Withdraw Daily</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your daily profit is automatically credited every 24 hours. Request cashout directly to your mobile wallet at min 100 PKR!
            </p>
          </div>
        </div>
      </section>

      {/* Referral System */}
      <section className="py-16 bg-gradient-to-r from-[#0f213d] via-[#132a4e] to-[#0a1628] border-y border-[#1e3a66]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Passive Income Program
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
                Earn Up to 10% with Our Multi-Tier Referral System
              </h2>
              <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                Invite your friends, colleagues, and followers to Digital Earn Money and unlock lifetime passive commissions on their package investments.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a1628]/80 border border-[#1e3a66]">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-[#00D4FF] flex items-center justify-center font-bold text-xl">
                    10%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Level 1 Direct Referrals</h4>
                    <p className="text-xs text-slate-400">
                      Earn an instant 10% cash bonus directly into your balance whenever your invitee deposits.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a1628]/80 border border-[#1e3a66]">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#FFD700] flex items-center justify-center font-bold text-xl">
                    2%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Level 2 Indirect Referrals</h4>
                    <p className="text-xs text-slate-400">
                      Earn an extra 2% commission from second-tier members invited by your team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/referrals"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00D4FF] text-[#0a1628] font-bold text-xs hover:brightness-110 transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>View Referral Team</span>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0a1628]/90 border border-[#1e3a66] p-8 shadow-2xl">
              <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                Commission Example
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If your direct referral deposits Plan 6 (13,275 PKR):
              </p>
              <div className="mt-4 p-4 rounded-xl bg-[#0f213d] border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-300">Level 1 Direct (10%)</p>
                  <p className="text-[11px] text-slate-500">10% of 13,275 PKR</p>
                </div>
                <p className="text-lg font-black text-[#00D4FF]">+ 1,327.50 PKR</p>
              </div>

              <div className="mt-3 p-4 rounded-xl bg-[#0f213d] border border-amber-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-300">Level 2 Indirect (2%)</p>
                  <p className="text-[11px] text-slate-500">2% of 13,275 PKR</p>
                </div>
                <p className="text-lg font-black text-[#FFD700]">+ 265.50 PKR</p>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                * All referral earnings can be withdrawn immediately without any restrictions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF] bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0f213d] border border-[#1e3a66] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between text-sm font-bold text-white hover:text-[#00D4FF] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#00D4FF]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-[#1e3a66]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp Community CTA - Updated Link */}
      <section className="py-12 bg-emerald-950/30 border-t border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">Join Our Official WhatsApp Channel</h3>
          <p className="text-xs text-slate-300 max-w-xl mx-auto mt-2">
            Daily payment proofs, new plan updates &amp; connect with 10,000+ active investors
          </p>
          <div className="mt-6">
            <a
              href="https://www.whatsapp.com/channel/0029VbE1E4jC6Zvj8sD3qU0U"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Join WhatsApp Channel</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
