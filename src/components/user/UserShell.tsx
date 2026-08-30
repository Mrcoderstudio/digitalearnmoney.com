"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Logo from "@/components/common/Logo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/plans", label: "Plans", icon: "📊" },
  { href: "/deposit", label: "Deposit", icon: "💳" },
  { href: "/withdrawal", label: "Withdraw", icon: "💸" },
  { href: "/referrals", label: "Referrals", icon: "👥" },
  { href: "/transactions", label: "History", icon: "🧾" },
  { href: "/support", label: "Support", icon: "📞" },
  { href: "https://whatsapp.com/channel/0029VbDW0RYJJhzahCh6uR26", label: "WhatsApp", icon: "📱", external: true },
];

export function UserShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a1628]" />;
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e3a66] bg-[#0f213d]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-white/10 md:hidden"
              onClick={() => setOpen(!open)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Logo light />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-300 sm:inline">👋 {username}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/30"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Sidebar Desktop */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1 rounded-xl border border-[#1e3a66] bg-[#0f213d] p-3">
            {NAV.map((n) => {
              const active = pathname === n.href;
              if (n.external) {
                return (
                  <a
                    key={n.href}
                    href={n.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    <span>{n.icon}</span>
                    {n.label}
                  </a>
                );
              }
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#00D4FF] text-[#0a1628]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Drawer */}
        {open && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="absolute left-0 top-0 h-full w-64 bg-[#0f213d] p-4 border-r border-[#1e3a66]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <Logo light />
              </div>
              <nav className="space-y-1">
                {NAV.map((n) => {
                  if (n.external) {
                    return (
                      <a
                        key={n.href}
                        href={n.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
                        onClick={() => setOpen(false)}
                      >
                        <span>{n.icon}</span>
                        {n.label}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium ${
                        pathname === n.href
                          ? "bg-[#00D4FF] text-[#0a1628]"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{n.icon}</span>
                      {n.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <span>🚪</span> Logout
                </button>
              </nav>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}