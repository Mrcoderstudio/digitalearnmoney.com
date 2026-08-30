"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  Settings,
  ArrowLeft,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<{ pendingDeposits: number; pendingWithdrawals: number }>({
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setCounts({
            pendingDeposits: data.stats.pendingDepositsCount || 0,
            pendingWithdrawals: data.stats.pendingWithdrawalsCount || 0,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    {
      name: "Deposits",
      href: "/admin/deposits",
      icon: ArrowDownCircle,
      badge: counts.pendingDeposits > 0 ? counts.pendingDeposits : null,
      badgeColor: "bg-emerald-500 text-black",
    },
    {
      name: "Withdrawals",
      href: "/admin/withdrawals",
      icon: ArrowUpCircle,
      badge: counts.pendingWithdrawals > 0 ? counts.pendingWithdrawals : null,
      badgeColor: "bg-amber-500 text-black",
    },
    { name: "Plans", href: "/admin/plans", icon: Layers },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#070e1a] border-r border-[#1e3a66] flex flex-col min-h-screen">
      <div className="p-5 border-b border-[#1e3a66]/60">
        {/* ✅ Removed href prop — Logo already links to / */}
        <Logo size="sm" />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#FFD700] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            Admin Panel
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live
          </span>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#00D4FF]/20 to-blue-600/10 text-[#00D4FF] border border-[#00D4FF]/40 shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-[#0f213d]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#00D4FF]" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#1e3a66]/60 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0f213d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to User App</span>
        </Link>
      </div>
    </aside>
  );
}