"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface DepositItem {
  id: string;
  amount: string;
  paymentMethod: string;
  senderName: string;
  transactionId: string;
  screenshot: string;
  status: string;
  adminNote?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  planName?: string | null;
}

export default function DepositHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/deposit/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.deposits) setDeposits(data.deposits);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const filteredDeposits =
    activeFilter === "all"
      ? deposits
      : deposits.filter((d) => d.status.toLowerCase() === activeFilter);

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col selection:bg-[#00D4FF]/30">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Deposit History</h1>
            <p className="text-xs text-slate-400 mt-1">Track all your submitted payments and plan activations</p>
          </div>
          <Link
            href="/deposit"
            className="px-4 py-2.5 rounded-xl bg-[#00D4FF] hover:bg-cyan-300 text-[#0a1628] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Make New Deposit</span>
          </Link>
        </div>

        {/* Filter Pills */}
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
              {f} ({f === "all" ? deposits.length : deposits.filter((d) => d.status === f).length})
            </button>
          ))}
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0f213d] border border-[#1e3a66] text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No deposit records found</p>
            <p className="text-xs text-slate-400">
              When you deposit via JazzCash, Easypaisa, or Bank, your submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-[#0f213d] border border-[#1e3a66] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a1628] text-slate-400 border-b border-[#1e3a66]">
                  <tr>
                    <th className="py-3.5 px-4">Plan / Amount</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Sender &amp; TID</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Receipt</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3a66]/60 text-slate-200">
                  {filteredDeposits.map((d) => {
                    const isApproved = d.status === "approved";
                    const isPending = d.status === "pending";
                    const isRejected = d.status === "rejected";

                    return (
                      <tr key={d.id} className="hover:bg-[#132a4e]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{d.planName || "Investment Plan"}</p>
                          <p className="text-xs font-black text-[#00D4FF]">
                            PKR {Number(d.amount).toLocaleString()}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">
                          {d.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-slate-200 font-medium">{d.senderName}</p>
                          <p className="text-[11px] font-mono text-slate-400">TID: {d.transactionId}</p>
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
                            <span className="capitalize">{d.status}</span>
                          </span>
                          {d.adminNote && (
                            <p className="text-[10px] text-slate-400 mt-1 max-w-xs">{d.adminNote}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {d.screenshot && (
                            <button
                              onClick={() => setPreviewScreenshot(d.screenshot)}
                              className="px-2 py-1 rounded-lg bg-[#0a1628] hover:bg-[#132a4e] text-[11px] font-semibold text-[#00D4FF] border border-[#1e3a66] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          {new Date(d.createdAt).toLocaleDateString()}
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

      {/* Screenshot Preview Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#0f213d] rounded-3xl border border-[#1e3a66] p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e3a66] pb-2">
              <h4 className="text-xs font-bold text-white">Payment Screenshot Proof</h4>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="p-1 rounded-lg bg-[#0a1628] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center bg-[#0a1628] rounded-2xl p-2 max-h-[70vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewScreenshot}
                alt="Deposit Proof"
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
