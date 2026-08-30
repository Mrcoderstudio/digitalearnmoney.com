"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Zap, LogOut, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminHeader({ title }: { title: string }) {
  const { data: session } = useSession();
  const [runningCron, setRunningCron] = useState(false);
  const [cronResult, setCronResult] = useState<{ message: string; success: boolean } | null>(null);

  const handleTriggerDailyRewards = async () => {
    if (!confirm("Are you sure you want to trigger daily rewards distribution for all active plans now?")) {
      return;
    }

    setRunningCron(true);
    setCronResult(null);

    try {
      const res = await fetch("/api/cron/daily-rewards", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCronResult({
          success: true,
          message: data.message || `Rewards credited: ${data.creditedCount} plans`,
        });
      } else {
        setCronResult({
          success: false,
          message: data.error || "Failed to trigger daily rewards",
        });
      }
    } catch {
      setCronResult({ success: false, message: "Network error triggering rewards" });
    } finally {
      setRunningCron(false);
      setTimeout(() => setCronResult(null), 6000);
    }
  };

  return (
    <header className="bg-[#0a1628]/95 border-b border-[#1e3a66] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">Digital Earn Money Control Center</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {cronResult && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold animate-in fade-in ${
              cronResult.success
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                : "bg-red-950/60 text-red-300 border border-red-500/40"
            }`}
          >
            {cronResult.success ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            )}
            <span>{cronResult.message}</span>
          </div>
        )}

        <button
          onClick={handleTriggerDailyRewards}
          disabled={runningCron}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
          title="Distribute daily earnings to all active plans"
        >
          {runningCron ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Zap className="w-4 h-4 fill-black" />
          )}
          <span>{runningCron ? "Distributing..." : "Run Daily Rewards"}</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[#1e3a66]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{session?.user?.username || "Admin"}</p>
            <p className="text-[10px] text-[#00D4FF]">Super Admin</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-xl bg-[#0f213d] border border-[#1e3a66] hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
