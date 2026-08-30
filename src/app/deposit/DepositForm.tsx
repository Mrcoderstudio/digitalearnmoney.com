"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, CheckCircle2, Loader2, Copy, Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  amount: string;
  dailyProfit: string;
  totalProfit: string;
}

interface DepositFormProps {
  plans: Plan[];
}

export function DepositForm({ plans }: DepositFormProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");
  const [senderName, setSenderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      setError("Please select a valid plan");
      return;
    }
    if (!senderName.trim() || !transactionId.trim()) {
      setError("Sender name and Transaction ID are required");
      return;
    }
    if (!screenshot) {
      setError("Please upload a payment screenshot");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: Number(selectedPlan.amount),
          paymentMethod: "easypaisa",
          senderName: senderName.trim(),
          transactionId: transactionId.trim(),
          screenshot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Deposit submission failed");
        setLoading(false);
        return;
      }

      setSuccess("Deposit submitted successfully! Waiting for admin approval.");
      setSenderName("");
      setTransactionId("");
      setScreenshot("");
      setLoading(false);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/40 flex items-center gap-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Step 1: Select Plan */}
      <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
        <label className="block text-xs font-bold text-slate-200 mb-3">
          1. Choose Investment Plan
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {plans.map((p) => {
            const isSelected = p.id === selectedPlanId;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#00D4FF]/10 border-[#00D4FF] shadow-sm shadow-cyan-500/20"
                    : "bg-[#0a1628] border-[#1e3a66] hover:border-slate-500 text-slate-300"
                }`}
              >
                <p className={`text-xs font-bold ${isSelected ? "text-[#00D4FF]" : "text-white"}`}>
                  {p.name}
                </p>
                <p className="text-xs font-extrabold text-white mt-1">
                  PKR {Number(p.amount).toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5">
                  +{Number(p.dailyProfit)} PKR/day
                </p>
              </button>
            );
          })}
        </div>
        {selectedPlan && (
          <div className="mt-3 p-3 rounded-lg bg-[#0a1628] border border-[#1e3a66] text-xs text-slate-300">
            <span className="font-semibold">Total Return:</span>{" "}
            <span className="text-[#00D4FF] font-bold">
              {Number(selectedPlan.totalProfit).toLocaleString()} PKR
            </span>{" "}
            in {selectedPlan.name}
          </div>
        )}
      </div>

      {/* Step 2: Easypaisa Details */}
      <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
        <div className="flex items-center gap-2 text-[#FFD700] mb-3">
          <span className="text-xs font-bold">💳 Easypaisa Payment Details</span>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">
              Account Name
            </span>
            <p className="text-sm font-bold text-white mt-0.5">Mohammed Younas</p>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">
              Easypaisa Number
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-mono font-black text-[#00D4FF]">03292993220</span>
              <button
                type="button"
                onClick={() => handleCopy("03292993220")}
                className="p-1.5 rounded-lg bg-[#0a1628] hover:bg-[#132a4e] text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Send the exact plan amount to this Easypaisa number.
        </p>
      </div>

      {/* Step 3: Transaction Details */}
      <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66] space-y-4">
        <label className="block text-xs font-bold text-slate-200">
          2. Enter Transfer Details
        </label>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Sender Full Name
          </label>
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
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Transaction ID / TID
          </label>
          <input
            type="text"
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. 1029384756"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Payment Screenshot
          </label>
          <div className="mt-1 flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#1e3a66] hover:border-[#00D4FF]/50 rounded-2xl bg-[#0a1628]/60 transition-colors relative">
            {screenshot ? (
              <div className="w-full flex flex-col items-center space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshot}
                  alt="Receipt Preview"
                  className="max-h-48 rounded-xl object-contain border border-[#1e3a66]"
                />
                <button
                  type="button"
                  onClick={() => setScreenshot("")}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-[#00D4FF]" />
                <span className="text-xs text-slate-300 font-semibold">
                  Click to upload screenshot
                </span>
                <span className="text-[10px] text-slate-500">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
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
          <>
            <span>Submit Deposit of PKR {selectedPlan ? Number(selectedPlan.amount).toLocaleString() : ""}</span>
          </>
        )}
      </button>
    </form>
  );
}