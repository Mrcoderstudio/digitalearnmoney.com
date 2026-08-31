"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/common/Logo";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  Users,
  HelpCircle,
  ShieldCheck,
  LogOut,
  User,
  History,
  Lock,
  Menu,
  X,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch live balance if logged in
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.balance !== undefined) {
            setBalance(data.user.balance);
          }
        })
        .catch(() => {});
    }
  }, [status, pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Plans", href: "/plans", icon: Layers },
    { name: "Deposit", href: "/deposit", icon: ArrowDownCircle },
    { name: "Withdraw", href: "/withdrawal", icon: ArrowUpCircle },
    { name: "Team", href: "/team", icon: Users },
    { name: "Support", href: "/support", icon: HelpCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0a1628]/90 backdrop-blur-md border-b border-[#1e3a66]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Logo />
            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30"
                        : "text-slate-300 hover:text-white hover:bg-[#0f213d]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            {/* WhatsApp channel button */}
            <Link
              href="/whatsapp"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Channel
            </Link>

            {status === "authenticated" ? (
              <div className="flex items-center gap-3">
                {/* Balance Badge */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-[#0f213d] border border-[#00D4FF]/30 hover:border-[#00D4FF] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all group"
                >
                  <Wallet className="w-4 h-4 text-[#FFD700] group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 leading-none">Balance</span>
                    <span className="text-white font-bold leading-tight">
                      PKR {balance !== null ? balance.toLocaleString() : "..."}
                    </span>
                  </div>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0f213d] border border-[#1e3a66] hover:border-[#00D4FF]/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00D4FF] to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      {session.user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-xs font-medium text-slate-200 pr-1 max-w-[100px] truncate">
                      {session.user?.username}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f213d] border border-[#1e3a66] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-[#1e3a66]/60">
                        <p className="text-xs font-semibold text-white truncate">
                          {session.user?.username}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{session.user?.email}</p>
                        {session.user?.role === "admin" && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-[#FFD700] border border-amber-500/40 rounded-full">
                            Administrator
                          </span>
                        )}
                      </div>

                      {session.user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#FFD700] hover:bg-[#132a4e] transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Control Panel
                        </Link>
                      )}

                      <Link
                        href="/deposit-history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#132a4e] transition-colors"
                      >
                        <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                        Deposit History
                      </Link>

                      <Link
                        href="/withdrawal-history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#132a4e] transition-colors"
                      >
                        <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                        Withdrawal History
                      </Link>

                      <Link
                        href="/transactions"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#132a4e] transition-colors"
                      >
                        <History className="w-4 h-4 text-cyan-400" />
                        Transactions Log
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#132a4e] transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </Link>

                      <Link
                        href="/change-password"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#132a4e] transition-colors"
                      >
                        <Lock className="w-4 h-4 text-slate-400" />
                        Change Password
                      </Link>

                      <div className="border-t border-[#1e3a66]/60 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            signOut({ callbackUrl: "/login" });
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#0f213d] rounded-xl border border-transparent transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-[#0a1628] bg-gradient-to-r from-[#00D4FF] to-cyan-400 hover:brightness-110 rounded-xl shadow-md shadow-cyan-500/20 transition-all"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            {status === "authenticated" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1 bg-[#0f213d] border border-[#00D4FF]/30 px-2.5 py-1 rounded-lg text-xs font-bold text-[#FFD700]"
              >
                PKR {balance !== null ? balance.toLocaleString() : "..."}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-[#0f213d] border border-[#1e3a66] text-slate-300 hover:text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a1628]/95 backdrop-blur-xl border-b border-[#1e3a66] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          {status === "authenticated" && (
            <div className="p-3 rounded-xl bg-[#0f213d] border border-[#1e3a66] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{session.user?.username}</p>
                <p className="text-[11px] text-slate-400">{session.user?.email}</p>
              </div>
              {session.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 text-[#FFD700] border border-amber-500/40 rounded-lg"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium ${
                    isActive
                      ? "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30"
                      : "bg-[#0f213d] text-slate-300 border border-[#1e3a66]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#1e3a66] space-y-1">
            <Link
              href="/whatsapp"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              Join Official WhatsApp Channel
            </Link>

            {status === "authenticated" ? (
              <>
                <Link
                  href="/deposit-history"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#0f213d]"
                >
                  <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                  Deposit History
                </Link>
                <Link
                  href="/withdrawal-history"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#0f213d]"
                >
                  <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                  Withdrawal History
                </Link>
                <Link
                  href="/transactions"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#0f213d]"
                >
                  <History className="w-4 h-4 text-cyan-400" />
                  Transactions
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#0f213d]"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile Settings
                </Link>
                <Link
                  href="/change-password"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#0f213d]"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  Change Password
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2 rounded-xl bg-[#0f213d] border border-[#1e3a66] text-xs font-semibold text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-400 text-xs font-bold text-[#0a1628]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
