import { db } from "@/db";
import { users, deposits, withdrawals, userPlans } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Total users
  const [totalUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "user"));

  // Pending deposits
  const [pendingDeposits] = await db
    .select({ count: count() })
    .from(deposits)
    .where(eq(deposits.status, "pending"));

  // Pending withdrawals
  const [pendingWithdrawals] = await db
    .select({ count: count() })
    .from(withdrawals)
    .where(eq(withdrawals.status, "pending"));

  // Total deposits (approved) — ✅ FIX: Convert to number
  const [totalDeposits] = await db
    .select({ total: sql<number>`COALESCE(SUM(${deposits.amount})::numeric, 0)` })
    .from(deposits)
    .where(eq(deposits.status, "approved"));

  // Total withdrawals (completed) — ✅ FIX: Convert to number
  const [totalWithdrawals] = await db
    .select({ total: sql<number>`COALESCE(SUM(${withdrawals.amount})::numeric, 0)` })
    .from(withdrawals)
    .where(eq(withdrawals.status, "completed"));

  // Active investments
  const [activeInvestments] = await db
    .select({ count: count() })
    .from(userPlans)
    .where(eq(userPlans.status, "active"));

  // ✅ Convert to numbers (in case they come as strings)
  const totalDepositsAmount = Number(totalDeposits?.total) || 0;
  const totalWithdrawalsAmount = Number(totalWithdrawals?.total) || 0;

  const stats = [
    { label: "Total Users", value: totalUsers?.count || 0, icon: "👥", color: "blue" },
    { label: "Pending Deposits", value: pendingDeposits?.count || 0, icon: "⏳", color: "yellow" },
    { label: "Pending Withdrawals", value: pendingWithdrawals?.count || 0, icon: "⏳", color: "yellow" },
    { label: "Total Deposits", value: `${totalDepositsAmount.toFixed(0)} PKR`, icon: "💰", color: "green" },
    { label: "Total Withdrawals", value: `${totalWithdrawalsAmount.toFixed(0)} PKR`, icon: "💸", color: "red" },
    { label: "Active Investments", value: activeInvestments?.count || 0, icon: "📈", color: "purple" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-400">Welcome back, Admin! 👑</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#1e3a66] bg-[#0f213d] p-4 text-center"
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            <p className="text-lg font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#1e3a66] bg-[#0f213d] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/deposits"
            className="rounded-lg bg-[#0a1628] p-4 text-center hover:bg-[#1e3a66] transition"
          >
            <span className="text-2xl">💳</span>
            <p className="text-sm text-white">Manage Deposits</p>
            {pendingDeposits?.count > 0 && (
              <span className="inline-block mt-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-500">
                {pendingDeposits.count} pending
              </span>
            )}
          </Link>
          <Link
            href="/admin/withdrawals"
            className="rounded-lg bg-[#0a1628] p-4 text-center hover:bg-[#1e3a66] transition"
          >
            <span className="text-2xl">💸</span>
            <p className="text-sm text-white">Manage Withdrawals</p>
            {pendingWithdrawals?.count > 0 && (
              <span className="inline-block mt-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-500">
                {pendingWithdrawals.count} pending
              </span>
            )}
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg bg-[#0a1628] p-4 text-center hover:bg-[#1e3a66] transition"
          >
            <span className="text-2xl">👥</span>
            <p className="text-sm text-white">Manage Users</p>
          </Link>
        </div>
      </div>
    </div>
  );
}