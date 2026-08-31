import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users, userPlans, plans, rewards, transactions, withdrawals, referrals } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { UserShell } from "@/components/user/UserShell";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Today's earning
  const todayRewards = await db
    .select({ total: sql<string>`coalesce(sum(${rewards.amount}), 0)` })
    .from(rewards)
    .where(and(eq(rewards.userId, userId), sql`DATE(${rewards.createdAt}) = ${todayStr}`));

  const todayEarning = Number(todayRewards[0]?.total || 0);

  // Active plans
  const activePlans = await db
    .select({
      id: userPlans.id,
      planId: userPlans.planId,
      planName: plans.name,
      amount: userPlans.amount,
      dailyProfit: userPlans.dailyProfit,
      duration: plans.duration,
      startDate: userPlans.startDate,
      endDate: userPlans.endDate,
      totalEarned: userPlans.totalEarned,
      status: userPlans.status,
    })
    .from(userPlans)
    .leftJoin(plans, eq(userPlans.planId, plans.id))
    .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")))
    .orderBy(desc(userPlans.createdAt));

  // Recent transactions
  const recentTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(5);

  // Referral counts
  const refCountL1 = await db
    .select({ count: sql<number>`count(*)` })
    .from(referrals)
    .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 1)));

  const refCountL2 = await db
    .select({ count: sql<number>`count(*)` })
    .from(referrals)
    .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 2)));

  // Total withdrawn
  const withdrawnSum = await db
    .select({ total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)` })
    .from(withdrawals)
    .where(and(eq(withdrawals.userId, userId), eq(withdrawals.status, "approved")));

  const pendingWithdrawnSum = await db
    .select({ total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)` })
    .from(withdrawals)
    .where(and(eq(withdrawals.userId, userId), eq(withdrawals.status, "pending")));

  // Get user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: Number(user.balance),
      totalEarned: Number(user.totalEarned),
      totalInvested: Number(user.totalInvested),
      referralCode: user.referralCode,
    },
    stats: {
      todayEarning,
      activePlansCount: activePlans.length,
      totalWithdrawn: Number(withdrawnSum[0]?.total || 0),
      pendingWithdrawals: Number(pendingWithdrawnSum[0]?.total || 0),
      referralsLevel1Count: Number(refCountL1[0]?.count || 0),
      referralsLevel2Count: Number(refCountL2[0]?.count || 0),
    },
    activePlans,
    recentTransactions,
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div>Please login</div>;
  }

  const data = await getDashboardData(user.id);

  return (
    <UserShell username={user.username}>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back, {user.username}! 👋</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0f213d] p-4 rounded-xl border border-[#1e3a66]">
            <p className="text-xs text-slate-400 mb-1">Balance</p>
            <p className="text-xl font-bold text-[#00D4FF]">{data.user.balance.toLocaleString()} PKR</p>
          </div>
          <div className="bg-[#0f213d] p-4 rounded-xl border border-[#1e3a66]">
            <p className="text-xs text-slate-400 mb-1">Invested</p>
            <p className="text-xl font-bold text-white">{data.user.totalInvested.toLocaleString()} PKR</p>
          </div>
          <div className="bg-[#0f213d] p-4 rounded-xl border border-[#1e3a66]">
            <p className="text-xs text-slate-400 mb-1">Active Plans</p>
            <p className="text-xl font-bold text-[#FFD700]">{data.stats.activePlansCount}</p>
          </div>
          <div className="bg-[#0f213d] p-4 rounded-xl border border-[#1e3a66]">
            <p className="text-xs text-slate-400 mb-1">Today's Earnings</p>
            <p className="text-xl font-bold text-emerald-400">+{data.stats.todayEarning.toLocaleString()} PKR</p>
          </div>
        </div>

        {/* Account Summary - Clean & Short */}
        <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
          <h3 className="text-sm font-bold text-white mb-4">Account Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Total Invested</p>
              <p className="text-sm font-bold text-white">{data.user.totalInvested.toLocaleString()} PKR</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Total Earned</p>
              <p className="text-sm font-bold text-emerald-400">{data.user.totalEarned.toLocaleString()} PKR</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Withdrawn</p>
              <p className="text-sm font-bold text-[#00D4FF]">{data.stats.totalWithdrawn.toLocaleString()} PKR</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Pending Withdraw</p>
              <p className="text-sm font-bold text-amber-400">{data.stats.pendingWithdrawals.toLocaleString()} PKR</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Referrals</p>
              <p className="text-sm font-bold text-white">{data.stats.referralsLevel1Count + data.stats.referralsLevel2Count}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Active Plans</p>
              <p className="text-sm font-bold text-[#FFD700]">{data.stats.activePlansCount}</p>
            </div>
          </div>
        </div>

        {/* Active Plans */}
        {data.activePlans.length > 0 && (
          <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Active Plans 🚀</h3>
              <span className="text-xs text-slate-400">{data.activePlans.length} active</span>
            </div>
            <div className="space-y-3">
              {data.activePlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg border border-[#1e3a66]">
                  <div>
                    <p className="font-semibold text-white text-sm">{plan.planName}</p>
                    <p className="text-xs text-slate-400">{Number(plan.amount).toLocaleString()} PKR • Daily: {Number(plan.dailyProfit).toLocaleString()} PKR</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-semibold">Active</p>
                    <p className="text-[10px] text-slate-400">{plan.duration}d left</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/plans" className="mt-3 text-xs text-[#00D4FF] hover:underline block text-center">
              Invest More →
            </Link>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Recent Transactions 📋</h3>
            <Link href="/transactions" className="text-xs text-[#00D4FF] hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No transactions yet</p>
            ) : (
              data.recentTransactions.map((tx) => {
                const isCredit = tx.type === "deposit" || tx.type === "investment" || tx.type === "reward";
                const isDebit = tx.type === "withdrawal";
                const isCompleted = tx.status === "completed";
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#1e3a66]/40 last:border-0">
                    <div className="flex items-center gap-3">
                      {isCredit && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                      {isDebit && <ArrowDownRight className="w-4 h-4 text-red-400" />}
                      <div>
                        <p className="text-xs text-white font-medium">{tx.description || tx.type}</p>
                        <p className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${isCredit ? 'text-emerald-400' : isDebit ? 'text-red-400' : 'text-white'}`}>
                        {isCredit ? '+' : isDebit ? '-' : ''}{Number(tx.amount).toLocaleString()} PKR
                      </p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${isCompleted ? 'bg-emerald-950/50 text-emerald-400' : 'bg-amber-950/50 text-amber-400'}`}>
                        {isCompleted ? 'completed' : tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </UserShell>
  );
}