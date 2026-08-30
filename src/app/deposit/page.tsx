"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Copy,
  Check,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  ArrowRight,
} from "lucide-react";
import { UserShell } from "@/components/user/UserShell";

interface PlanItem {
  id: string;
  name: string;
  amount: string;
  dailyProfit: string;
  totalProfit: string;
}

function DepositContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [easypaisaDetails, setEasypaisaDetails] = useState({
    name: "Mohammed Younas",
    number: "03292993220",
  });
  const [senderName, setSenderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Fetch plans
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setPlans(data);
          const paramPlan = searchParams.get("planId");
          if (paramPlan && data.some((p: PlanItem) => p.id === paramPlan)) {
            setSelectedPlanId(paramPlan);
          } else {
            setSelectedPlanId(data[0].id);
          }
        }
      })
      .catch(() => {});

    // Fetch Easypaisa details from settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.easypaisaName) {
          setEasypaisaDetails({
            name: data.easypaisaName,
            number: data.easypaisaNumber || "03292993220",
          });
        }
      })
      .catch(() => {});
  }, [status, router, searchParams]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
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
      setError("Please upload a payment screenshot receipt");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

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

      setSuccessMsg(data.message || "Deposit submitted successfully! It will be verified shortly.");
      setSenderName("");
      setTransactionId("");
      setScreenshot("");
      setLoading(false);
    } catch {
      setError("Network error submitting deposit. Please try again.");
      setLoading(false);
    }
  };

  // ✅ Deposit Content
  const content = (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Make a Deposit</h1>
        <p className="text-xs text-slate-400 mt-1">
          Choose a plan, pay via Easypaisa, and upload the receipt for verification.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <p className="text-xs text-emerald-400/90 pl-7">
            Your deposit will be reviewed by admin. You'll be notified upon approval.
          </p>
          <div className="pt-2 pl-7 flex gap-3">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-[#00D4FF] text-[#0a1628] font-bold text-xs"
            >
              Go to Dashboard
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
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0f213d] border border-[#1e3a66] space-y-6 shadow-xl">
            {/* Step 1: Select Plan */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
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
            </div>

            {/* Step 2: Easypaisa Details */}
            <div className="bg-[#0a1628] p-4 rounded-xl border border-[#1e3a66]">
              <div className="flex items-center gap-2 text-[#FFD700] mb-3">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold">Easypaisa Payment Details</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                    Account Name
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{easypaisaDetails.name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                    Easypaisa Number
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-sm font-mono font-black text-[#00D4FF]">{easypaisaDetails.number}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(easypaisaDetails.number, "easypaisa")}
                      className="p-1.5 rounded-lg bg-[#0f213d] hover:bg-[#132a4e] text-slate-300 transition-colors"
                    >
                      {copiedField === "easypaisa" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Send the exact plan amount to this Easypaisa number.
              </p>
            </div>

            {/* Step 3: Transaction Info */}
            <div className="space-y-4 pt-2 border-t border-[#1e3a66]">
              <label className="block text-xs font-bold text-slate-200">
                2. Enter Transfer Details
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Sender Full Name (as per Easypaisa account)
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
                  Transaction ID / TID (from SMS or receipt)
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
                  Payment Receipt Screenshot
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
                        Remove &amp; Select Different Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-[#00D4FF]" />
                      <span className="text-xs text-slate-300 font-semibold">
                        Click to upload payment screenshot
                      </span>
                      <span className="text-[10px] text-slate-500">
                        PNG, JPG up to 5MB
                      </span>
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-400 hover:brightness-110 text-[#0a1628] font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0a1628]" />
                    <span>Submitting Deposit...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Submit Deposit of PKR {selectedPlan ? Number(selectedPlan.amount).toLocaleString() : ""}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#132a4e] to-[#0f213d] border border-[#00D4FF]/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#FFD700]">
              <Info className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Important</h3>
            </div>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li>Send exact plan amount</li>
              <li>Use the Easypaisa number above</li>
              <li>Keep the screenshot clear</li>
              <li>Approval usually takes 15-30 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ Wrap with UserShell to show sidebar menu
  return <UserShell username={session?.user?.username || "User"}>{content}</UserShell>;
}

export default function DepositPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white text-xs">Loading...</div>}>
      <DepositContent />
    </Suspense>
  );
}