"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface ReferralShareProps {
  referralCode: string;
}

export function ReferralShare({ referralCode }: ReferralShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="rounded-xl border border-[#1e3a66] bg-[#0f213d] p-6">
      <h3 className="text-sm font-semibold text-white mb-2">Your Referral Link</h3>
      <div className="flex items-center gap-3">
        <input
          type="text"
          readOnly
          value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referralCode}`}
          className="flex-1 rounded-lg bg-[#0a1628] border border-[#1e3a66] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
            copied
              ? "bg-green-500 text-white"
              : "bg-[#00D4FF] text-[#0a1628] hover:bg-[#00B8E6]"
          }`}
        >
          {copied ? "✅ Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Share this link with your friends. You'll earn 10% on their first deposit!
      </p>
    </div>
  );
}