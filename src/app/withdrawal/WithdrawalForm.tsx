"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface WithdrawalFormProps {
  balance: number;
  minWithdrawal: number;
}

export function WithdrawalForm({ balance, minWithdrawal }: WithdrawalFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("easypaisa");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState(""); // for All Banks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < minWithdrawal) {
      toast.error(`Minimum withdrawal is ${minWithdrawal} PKR`);
      return;
    }
    if (amountNum > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!accountHolder.trim()) {
      toast.error("Please enter account holder name");
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("Please enter account number");
      return;
    }
    if (method === "bank" && !bankName.trim()) {
      toast.error("Please enter bank name");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        amount: amountNum,
        method,
        accountDetails: {
          accountHolder: accountHolder.trim(),
          accountNumber: accountNumber.trim(),
        },
      };
      if (method === "bank") {
        payload.accountDetails.bankName = bankName.trim();
      }

      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Withdrawal failed");
        setLoading(false);
        return;
      }
      toast.success("Withdrawal request submitted!");
      setSuccess("Request submitted successfully!");
      setAmount("");
      setAccountHolder("");
      setAccountNumber("");
      setBankName("");
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0f213d] border border-[#1e3a66] space-y-6 shadow-xl">
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/40 flex items-center gap-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-200 mb-2">
          1. Enter Withdrawal Amount
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">PKR</span>
          <input
            type="number"
            required
            min={minWithdrawal}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min ${minWithdrawal} PKR`}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          Minimum withdrawal: <span className="text-[#FFD700] font-bold">{minWithdrawal} PKR</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-200 mb-2">
          2. Select Withdrawal Method
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { id: "easypaisa", label: "Easypaisa", icon: "📱" },
            { id: "jazzcash", label: "JazzCash", icon: "📱" },
            { id: "bank", label: "All Banks", icon: "🏦" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                method === m.id
                  ? "bg-[#00D4FF]/10 border-[#00D4FF] shadow-sm shadow-cyan-500/20"
                  : "bg-[#0a1628] border-[#1e3a66] hover:border-slate-500 text-slate-300"
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <p className={`text-xs font-medium ${method === m.id ? "text-[#00D4FF]" : "text-white"}`}>
                {m.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-[#1e3a66]">
        <label className="block text-xs font-bold text-slate-200">3. Enter Account Details</label>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Account Holder Name
          </label>
          <input
            type="text"
            required
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="e.g. Muhammad Ali"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Account Number
          </label>
          <input
            type="text"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="e.g. 0333-1234567"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        {method === "bank" && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Meezan Bank"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-400 hover:brightness-110 text-[#0a1628] font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#0a1628]" />
            <span>Submitting...</span>
          </>
        ) : (
          "Submit Withdrawal Request"
        )}
      </button>
    </form>
  );
}
