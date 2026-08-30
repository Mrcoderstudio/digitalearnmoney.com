"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  Wallet,
  ArrowUpCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";

export default function WithdrawalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"JazzCash" | "Easypaisa" | "All Banks">("JazzCash");
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setBalance(data.user.balance);
          }
          setPageLoading(false);
        })
        .catch(() => setPageLoading(false));
    }
  }, [status, router]);

  const handleMaxClick = () => {
    if (balance > 0) {
      setAmount(Math.floor(balance).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 30) {
      setError("Minimum withdrawal amount is 30 PKR");
      return;
    }

    if (numAmount > balance) {
      setError(`Insufficient balance. Maximum you can withdraw is PKR ${balance.toFixed(2)}`);
      return;
    }

    if (!accountTitle.trim() || !accountNumber.trim()) {
      setError("Please fill in your account title and account number");
      return;
    }

    if (method === "All Banks" && !bankName.trim()) {
      setError("Please provide your bank name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          method,
          accountTitle: accountTitle.trim(),
          accountNumber: accountNumber.trim(),
          bankName: method === "All Banks" ? bankName.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Withdrawal request failed");
        setLoading(false);
        return;
      }

      setBalance(data.remainingBalance);
      setSuccess(data.message || "Withdrawal request submitted successfully!");
      setAmount("");
      setAccountTitle("");
      setAccountNumber("");
      setBankName("");
      setLoading(false);
    } catch {
      setError("Network error submitting withdrawal. Please try again.");
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col selection:bg-[#00D4FF]/30">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Withdraw Funds</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cash out your daily earnings directly into your JazzCash, Easypaisa, or Pakistani Bank account.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
            <p className="text-xs text-emerald-400/90 pl-7">
              Funds will be dispatched to your account promptly by our finance team.
            </p>
            <div className="pt-2 pl-7 flex gap-3">
              <Link
                href="/withdrawal-history"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs"
              >
                View Withdrawal History
              </Link>
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-lg bg-[#0f213d] text-white border border-[#1e3a66] font-semibold text-xs"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/40 flex items-center gap-3 text-xs text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form (2 cols) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0f213d] border border-[#1e3a66] space-y-6 shadow-xl">
              {/* Method */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  1. Select Cashout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["JazzCash", "Easypaisa", "All Banks"] as const).map((m) => {
                    const isSelected = method === m;
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? "bg-[#00D4FF] text-[#0a1628] border-[#00D4FF] shadow-md shadow-cyan-500/20"
                            : "bg-[#0a1628] text-slate-300 border-[#1e3a66] hover:border-slate-500"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-200">
                    2. Withdrawal Amount (PKR)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Available: <strong className="text-[#FFD700]">PKR {balance.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="30"
                    max={balance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min 30 PKR"
                    className="w-full pl-3.5 pr-16 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
                  />
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-[#0f213d] hover:bg-[#132a4e] text-[#00D4FF] border border-[#00D4FF]/30 transition-colors"
                  >
                    Max
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Minimum withdrawal is 30 PKR. No hidden fees.
                </p>
              </div>

              {/* Account Details */}
              <div className="space-y-4 pt-2 border-t border-[#1e3a66]">
                <label className="block text-xs font-bold text-slate-200">
                  3. Your Destination Account Details
                </label>

                {method === "All Banks" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Meezan Bank, HBL, UBL, Alfalah"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Account Title (Exact Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {method === "All Banks" ? "IBAN or Account Number" : `${method} Mobile Number`}
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={method === "All Banks" ? "PK36..." : "03XXXXXXXXX"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || balance < 30}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-400 hover:brightness-110 text-[#0a1628] font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0a1628]" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Withdrawal Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right rules & balance column (1 col) */}
          <div className="space-y-6">
            {/* Balance Summary Card */}
            <div className="p-6 rounded-3xl bg-[#0f213d] border border-[#00D4FF]/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Available to Withdraw</span>
                <Wallet className="w-4 h-4 text-[#FFD700]" />
              </div>
              <p className="text-3xl font-black text-white">
                PKR {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400">
                Minimum required to withdraw: <strong>30 PKR</strong>
              </p>
            </div>

            {/* Rules card */}
            <div className="p-6 rounded-3xl bg-[#0f213d] border border-[#1e3a66] space-y-4 text-xs text-slate-300">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Withdrawal Policy
              </h3>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#00D4FF] shrink-0 mt-0.5" />
                  <span>Processing window: usually 15–60 minutes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#FFD700] shrink-0 mt-0.5" />
                  <span>Double check your account number before submitting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>If rejected by admin for any reason, funds are instantly refunded to your balance.</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-[#1e3a66]/60">
                <Link
                  href="/withdrawal-history"
                  className="text-xs font-semibold text-[#00D4FF] hover:underline flex items-center gap-1"
                >
                  <span>View past withdrawals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
