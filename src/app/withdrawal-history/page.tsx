"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface WithdrawalItem {
  id: string;
  amount: string;
  method: string;
  accountDetails: {
    accountTitle?: string;
    accountNumber?: string;
    bankName?: string;
  };
  status: string;
  adminNote?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export default function WithdrawalHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/withdrawal/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.withdrawals) setWithdrawals(data.withdrawals);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const filtered =
    activeFilter === "all"
      ? withdrawals
      : withdrawals.filter((w) => w.status.toLowerCase() === activeFilter);

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col selection:bg-[#00D4FF]/30">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Withdrawal History</h1>
            <p className="text-xs text-slate-400 mt-1">Review all your payout requests and transfer statuses</p>
          </div>
          <Link
            href="/withdrawal"
            className="px-4 py-2.5 rounded-xl bg-[#00D4FF] hover:bg-cyan-300 text-[#0a1628] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
          >
            <ArrowUpCircle className="w-4 h-4 text-black" />
            <span>Request Withdrawal</span>
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer shrink-0 ${
                activeFilter === f
                  ? "bg-[#00D4FF] text-[#0a1628]"
                  : "bg-[#0f213d] text-slate-400 hover:text-white border border-[#1e3a66]"
              }`}
            >
              {f} ({f === "all" ? withdrawals.length : withdrawals.filter((w) => w.status === f).length})
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0f213d] border border-[#1e3a66] text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No withdrawal requests found</p>
            <p className="text-xs text-slate-400">
              When you submit a withdrawal, you can track the review process here.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-[#0f213d] border border-[#1e3a66] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a1628] text-slate-400 border-b border-[#1e3a66]">
                  <tr>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Account Destination</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3a66]/60 text-slate-200">
                  {filtered.map((w) => {
                    const isApproved = w.status === "approved";
                    const isPending = w.status === "pending";
                    const isRejected = w.status === "rejected";

                    return (
                      <tr key={w.id} className="hover:bg-[#132a4e]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-white text-sm">
                            PKR {Number(w.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#00D4FF]">
                          {w.method}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">
                            {w.accountDetails?.accountTitle || "N/A"}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {w.accountDetails?.accountNumber}
                            {w.accountDetails?.bankName ? ` (${w.accountDetails.bankName})` : ""}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isApproved
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : isPending
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {isApproved && <CheckCircle className="w-3 h-3" />}
                            {isPending && <Clock className="w-3 h-3" />}
                            {isRejected && <XCircle className="w-3 h-3" />}
                            <span className="capitalize">{w.status}</span>
                          </span>
                          {w.adminNote && (
                            <p className="text-[10px] text-slate-400 mt-1 max-w-xs">{w.adminNote}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
