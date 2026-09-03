"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Upload, AlertCircle, CheckCircle2, Loader2, Copy, Check } from "lucide-react";

export function DepositForm() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [senderName, setSenderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        toast.success("Screenshot uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 300) {
      toast.error("Minimum deposit amount is 300 PKR");
      return;
    }
    if (!senderName.trim()) {
      toast.error("Please enter your sender name");
      return;
    }
    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }
    if (!screenshot) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        amount: amountNum,
        paymentMethod: "easypaisa",
        senderName: senderName.trim(),
        transactionId: transactionId.trim(),
        screenshot,
      };

      console.log("📤 Submitting deposit:", payload);

      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Deposit response:", data);

      if (!res.ok) {
        toast.error(data.error || "Deposit submission failed");
        setLoading(false);
        return;
      }

      toast.success("Deposit submitted successfully! Waiting for admin approval.");
      setSenderName("");
      setTransactionId("");
      setScreenshot("");
      setAmount("");
      setLoading(false);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error("❌ Deposit error:", err);
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="bg-[#0a1628] p-4 rounded-xl border border-[#00D4FF]/30">
        <div className="flex items-center gap-2 text-[#FFD700] mb-2">
          <span className="text-xs font-bold">📌 Important</span>
        </div>
        <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
          <li>Minimum deposit: <span className="text-[#FFD700] font-bold">300 PKR</span></li>
          <li>Send exact amount to Easypaisa number below</li>
          <li>Keep the screenshot clear</li>
          <li>Approval usually takes 15-30 minutes</li>
        </ul>
      </div>

      <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
        <label className="block text-xs font-bold text-slate-200 mb-2">1. Enter Deposit Amount</label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">PKR</span>
          <input
            type="number"
            required
            min="300"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (min 300)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>
      </div>

      <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
        <div className="flex items-center gap-2 text-[#FFD700] mb-3">
          <span className="text-xs font-bold">💳 Easypaisa Payment Details</span>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Account Name</span>
            <p className="text-sm font-bold text-white mt-0.5">Najma Hamid</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Easypaisa Number</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-mono font-black text-[#00D4FF]">03030050877</span>
              <button
                type="button"
                onClick={() => handleCopy("03030050877")}
                className="p-1.5 rounded-lg bg-[#0a1628] hover:bg-[#132a4e] text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66] space-y-4">
        <label className="block text-xs font-bold text-slate-200">2. Enter Transfer Details</label>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sender Full Name</label>
          <input
            type="text"
            required
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. Muhammad Ali"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Transaction ID / TID</label>
          <input
            type="text"
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. 1029384756"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Screenshot</label>
          <div className="mt-1 flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#1e3a66] hover:border-[#00D4FF]/50 rounded-2xl bg-[#0a1628]/60 transition-colors relative">
            {screenshot ? (
              <div className="w-full flex flex-col items-center space-y-2">
                <img src={screenshot} alt="Receipt Preview" className="max-h-48 rounded-xl object-contain border border-[#1e3a66]" />
                <button type="button" onClick={() => setScreenshot("")} className="text-xs text-red-400 hover:underline">Remove Image</button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-[#00D4FF]" />
                <span className="text-xs text-slate-300 font-semibold">Click to upload screenshot</span>
                <span className="text-[10px] text-slate-500">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
        </div>
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
          <span>Submit Deposit of PKR {amount ? Number(amount).toLocaleString() : "0"}</span>
        )}
      </button>
    </form>
  );
}
