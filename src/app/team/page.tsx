"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Users,
  Copy,
  Check,
  Award,
  Sparkles,
  Share2,
  Loader2,
  Calendar,
  Layers,
  MessageCircle,
} from "lucide-react";

interface ReferralData {
  referralCode: string;
  level1Members: Array<{
    id: string;
    username: string;
    email: string;
    totalInvested: string;
    createdAt: string;
  }>;
  level2Members: Array<{
    id: string;
    username: string;
    email: string;
    totalInvested: string;
    createdAt: string;
  }>;
  level1Earnings: number;
  level2Earnings: number;
  totalCommission: number;
  commissionsLog: Array<{
    id: string;
    level: number;
    commission: string;
    status: string;
    paidAt: string;
    createdAt: string;
  }>;
}

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"l1" | "l2" | "logs">("l1");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/referral")
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const referralUrl =
    typeof window !== "undefined" && data?.referralCode
      ? `${window.location.origin}/register?ref=${data.referralCode}`
      : "";

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join Digital Earn Money with my referral link and start earning daily profits from 140 PKR!\n${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (loading) {
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Referral Team</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build your team network and receive automatic passive commissions on every deposit.
          </p>
        </div>

        {/* Link Share Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f213d] via-[#132a4e] to-[#0a1628] border border-[#00D4FF]/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Referral Link &amp; Code
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Share &amp; Earn 10% (Level 1) + 2% (Level 2)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Your Code:</span>
              <span className="px-3 py-1 rounded-xl bg-[#0a1628] border border-[#FFD700]/40 text-[#FFD700] font-mono font-bold text-xs">
                {data?.referralCode}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-slate-200 font-mono truncate focus:outline-none"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#00D4FF] hover:bg-cyan-300 text-[#0a1628] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0f213d] border border-[#1e3a66] shadow-lg">
            <span className="text-xs text-slate-400 font-medium">Level 1 Commission (10%)</span>
            <p className="text-2xl font-extrabold text-[#00D4FF] mt-2">
              PKR {(data?.level1Earnings || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Direct members: <strong>{data?.level1Members.length || 0}</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f213d] border border-[#1e3a66] shadow-lg">
            <span className="text-xs text-slate-400 font-medium">Level 2 Commission (2%)</span>
            <p className="text-2xl font-extrabold text-[#FFD700] mt-2">
              PKR {(data?.level2Earnings || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Sub-tier members: <strong>{data?.level2Members.length || 0}</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f213d] border border-[#1e3a66] shadow-lg">
            <span className="text-xs text-slate-400 font-medium">Total Referral Rewards</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">
              PKR {(data?.totalCommission || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Credited directly to wallet</p>
          </div>
        </div>

        {/* Tabs & Table */}
        <div className="rounded-3xl bg-[#0f213d] border border-[#1e3a66] overflow-hidden shadow-xl">
          {/* Tab buttons */}
          <div className="flex border-b border-[#1e3a66] bg-[#0a1628]">
            <button
              onClick={() => setActiveTab("l1")}
              className={`px-5 py-3.5 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "l1"
                  ? "border-[#00D4FF] text-[#00D4FF] bg-[#0f213d]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Level 1 Direct ({data?.level1Members.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab("l2")}
              className={`px-5 py-3.5 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "l2"
                  ? "border-[#FFD700] text-[#FFD700] bg-[#0f213d]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Level 2 Indirect ({data?.level2Members.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-5 py-3.5 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "logs"
                  ? "border-emerald-400 text-emerald-400 bg-[#0f213d]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Commission History ({data?.commissionsLog.length || 0})</span>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "l1" && (
              <div>
                {data?.level1Members.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No direct Level 1 team members yet. Share your referral link above to start earning!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0a1628] text-slate-400">
                        <tr>
                          <th className="py-3 px-4">Username</th>
                          <th className="py-3 px-4">Total Invested</th>
                          <th className="py-3 px-4">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e3a66]/60">
                        {data?.level1Members.map((m) => (
                          <tr key={m.id} className="hover:bg-[#132a4e]/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-white">{m.username}</td>
                            <td className="py-3 px-4 text-[#00D4FF] font-semibold">
                              PKR {Number(m.totalInvested).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "l2" && (
              <div>
                {data?.level2Members.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No Level 2 team members yet. They will appear here when your direct referrals invite others!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0a1628] text-slate-400">
                        <tr>
                          <th className="py-3 px-4">Username</th>
                          <th className="py-3 px-4">Total Invested</th>
                          <th className="py-3 px-4">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e3a66]/60">
                        {data?.level2Members.map((m) => (
                          <tr key={m.id} className="hover:bg-[#132a4e]/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-white">{m.username}</td>
                            <td className="py-3 px-4 text-[#FFD700] font-semibold">
                              PKR {Number(m.totalInvested).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div>
                {data?.commissionsLog.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No commissions credited yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0a1628] text-slate-400">
                        <tr>
                          <th className="py-3 px-4">Tier Level</th>
                          <th className="py-3 px-4">Commission</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Credited Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e3a66]/60">
                        {data?.commissionsLog.map((c) => (
                          <tr key={c.id} className="hover:bg-[#132a4e]/40 transition-colors">
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D4FF]/20 text-[#00D4FF]">
                                Level {c.level} ({c.level === 1 ? "10%" : "2%"})
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-400">
                              + PKR {Number(c.commission).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
