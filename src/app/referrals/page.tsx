"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserShell } from "@/components/user/UserShell";
import { Copy, Check, Users, Gift, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

interface ReferralData {
  level1Count: number;
  level2Count: number;
  level1Bonus: number;
  level2Bonus: number;
  totalBonus: number;
  referralLink: string;
}

export default function ReferralsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <UserShell username={session?.user?.username || "User"}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-slate-400">Loading referral data...</p>
          </div>
        </div>
      </UserShell>
    );
  }

  return (
    <UserShell username={session?.user?.username || "User"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-[#FFD700]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Referrals</h1>
            <p className="text-xs text-slate-400">Invite friends and earn bonuses</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f213d] p-4 rounded-xl border border-[#1e3a66]">
            <p className="text-xs text-slate-400">Level 1</p>
            <p className="text-xl font-bold text-white">{data?.level1Count || 0}</p>
            <p className="text-[10px] text-emerald-400">10% bonus</p>
          </div>
          <div className="bg-[#0f213d] p-4 rounded-xl border border-[#1e3a66]">
            <p className="text-xs text-slate-400">Level 2</p>
            <p className="text-xl font-bold text-white">{data?.level2Count || 0}</p>
            <p className="text-[10px] text-emerald-400">2% bonus</p>
          </div>
          <div className="bg-[#0f213d] p-4 rounded-xl border border-[#1e3a66]">
            <p className="text-xs text-slate-400">Total Earned</p>
            <p className="text-xl font-bold text-[#FFD700]">
              PKR {data?.totalBonus?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66] space-y-4">
          <h3 className="text-sm font-bold text-white">Your Referral Link</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={data?.referralLink || ""}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0a1628] border border-[#1e3a66] text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-[#00D4FF] text-[#0a1628] font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Share this link with your friends. When they deposit, you earn 10% (Level 1) and 2% (Level 2)!
          </p>
        </div>

        {/* How it works */}
        <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66] space-y-3">
          <h3 className="text-sm font-bold text-white">How it Works</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-[#00D4FF]">1.</span>
              <span>Share your referral link with friends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00D4FF]">2.</span>
              <span>They register using your link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00D4FF]">3.</span>
              <span>When they deposit, you get <span className="text-[#FFD700]">10%</span> bonus (Level 1)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00D4FF]">4.</span>
              <span>If your referred friend refers someone, you get <span className="text-[#FFD700]">2%</span> bonus (Level 2)</span>
            </li>
          </ul>
        </div>
      </div>
    </UserShell>
  );
}
