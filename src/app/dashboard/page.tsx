import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, userPlans, transactions, plans, deposits, withdrawals, referrals } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { UserShell } from "@/components/user/UserShell";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || !session.user || !session.user.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Session expired. Please login again.</p>
          <Link href="/login" className="mt-4 inline-block text-[#00D4FF] hover:underline">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">User not found.</p>
          <Link href="/logout" className="mt-4 inline-block text-[#00D4FF] hover:underline">
            Logout →
          </Link>
        </div>
      </div>
    );
  }

  // Active plans
  const activePlans = await db
    .select({
      id: userPlans.id,
      planId: userPlans.planId,
      amount: userPlans.amount,
      dailyProfit: userPlans.dailyProfit,
      totalEarned: userPlans.totalEarned,
      startDate: userPlans.startDate,
      endDate: userPlans.endDate,
      status: userPlans.status,
      planName: plans.name,
    })
    .from(userPlans)
    .leftJoin(plans, eq(userPlans.planId, plans.id))
    .where(
      and(
        eq(userPlans.userId, userId),
        eq(userPlans.status, "active")
      )
    )
    .orderBy(desc(userPlans.createdAt));

  // Recent transactions
  const recentTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(10);

  const totalInvested = activePlans.reduce(
    (sum, plan) => sum + Number(plan.amount),
    0
  );

  // Today's earning
  const today = new Date();
  today.setHours(today.getHours() - 24);
  const todayEarnings = await db
    .select({
      total: sql<number>`SUM(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "reward"),
        sql`${transactions.createdAt} >= ${today}`
      )
    );
  const todayEarning = todayEarnings[0]?.total || 0;

  // Account Summary Data
  const withdrawnResult = await db
    .select({
      total: sql<number>`SUM(${withdrawals.amount})`,
    })
    .from(withdrawals)
    .where(
      and(
        eq(withdrawals.userId, userId),
        eq(withdrawals.status, "completed")
      )
    );
  const totalWithdrawn = withdrawnResult[0]?.total || 0;

  const payoutResult = await db
    .select({
      total: sql<number>`SUM(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.amount} > 0`
      )
    );
  const totalPayout = payoutResult[0]?.total || 0;

  const referralResult = await db
    .select({
      total: sql<number>`SUM(${referrals.commission})`,
    })
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, userId),
        eq(referrals.status, "paid")
      )
    );
  const totalReferral = referralResult[0]?.total || 0;

  const pendingDepositResult = await db
    .select({
      total: sql<number>`SUM(${deposits.amount})`,
    })
    .from(deposits)
    .where(
      and(
        eq(deposits.userId, userId),
        eq(deposits.status, "pending")
      )
    );
  const pendingDeposit = pendingDepositResult[0]?.total || 0;

  const pendingWithdrawalResult = await db
    .select({
      total: sql<number>`SUM(${withdrawals.amount})`,
    })
    .from(withdrawals)
    .where(
      and(
        eq(withdrawals.userId, userId),
        eq(withdrawals.status, "pending")
      )
    );
  const pendingWithdrawal = pendingWithdrawalResult[0]?.total || 0;

  const teamCountResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .where(eq(users.referredBy, userId));
  const teamCount = teamCountResult[0]?.count || 0;

  const teamInvestResult = await db
    .select({
      total: sql<number>`SUM(${userPlans.amount})`,
    })
    .from(userPlans)
    .innerJoin(users, eq(userPlans.userId, users.id))
    .where(eq(users.referredBy, userId));
  const teamInvest = teamInvestResult[0]?.total || 0;

  const summaryItems = [
    { label: "TOTAL INVESTED", value: totalInvested },
    { label: "WITHDRAWAL", value: totalWithdrawn },
    { label: "PAYOUT", value: totalPayout },
    { label: "REFER BONUS", value: totalReferral },
    { label: "PENDING DEPOSIT", value: pendingDeposit },
    { label: "PENDING WITHDRAWAL", value: pendingWithdrawal },
    { label: "TEAM", value: `${teamCount} users` },
    { label: "TEAM INVEST", value: teamInvest },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit": return "text-green-500";
      case "withdrawal": return "text-red-500";
      case "reward": return "text-[#00D4FF]";
      case "referral": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit": return "⬇️";
      case "withdrawal": return "⬆️";
      case "reward": return "⭐";
      case "referral": return "👥";
      default: return "📝";
    }
  };

  // ✅ Dashboard Content
  const content = (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, {user.username}! 👋</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-[#6C3CE1]/20 to-[#00D4FF]/20 px-5 py-3 text-center border border-[#6C3CE1]/20">
          <p className="text-xs text-gray-400">Today's Earnings</p>
          <p className="text-xl font-bold text-[#00D4FF]">
            +{Number(todayEarning).toFixed(2)} PKR
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-400">Balance</p>
          <p className="text-xl font-bold text-white">
            {Number(user.balance).toFixed(0)} PKR
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-400">Total Invested</p>
          <p className="text-xl font-bold text-white">
            {totalInvested.toFixed(0)} PKR
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-400">Active Plans</p>
          <p className="text-xl font-bold text-white">
            {activePlans.length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-400">Total Earned</p>
          <p className="text-xl font-bold text-white">
            {Number(user.totalEarned).toFixed(0)} PKR
          </p>
        </div>
      </div>

      {/* Active Plans */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Plans 🚀</h2>
          <span className="text-sm text-gray-400">{activePlans.length} active</span>
        </div>
        {activePlans.length > 0 ? (
          <div className="space-y-3">
            {activePlans.map((plan) => {
              const remainingDays = Math.ceil(
                (new Date(plan.endDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={plan.id}
                  className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{plan.planName}</p>
                    <p className="text-sm text-gray-400">
                      {Number(plan.amount).toFixed(0)} PKR • Daily:{" "}
                      {Number(plan.dailyProfit).toFixed(0)} PKR
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Earned</p>
                      <p className="font-semibold text-[#00D4FF]">
                        {Number(plan.totalEarned).toFixed(0)} PKR
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="font-semibold text-white">
                        {remainingDays > 0 ? `${remainingDays}d` : "✅ Done"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#00FF88]/20 px-3 py-1 text-xs font-semibold text-[#00FF88]">
                      {plan.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-400">No active plans</p>
            <Link href="/plans" className="mt-2 inline-block text-[#00D4FF] hover:underline">
              Invest Now →
            </Link>
          </div>
        )}
      </div>

      {/* Account Summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 font-semibold text-white">Account Summary</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryItems.map((item, index) => (
            <div key={index} className="rounded-lg border border-white/5 bg-white/5 p-3 text-center">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-lg font-bold text-white">
                {typeof item.value === "number" ? `Rs. ${item.value.toFixed(0)}` : item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Transactions 📋</h2>
          <Link href="/transactions" className="text-sm text-[#00D4FF] hover:underline">
            View All →
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getTypeIcon(tx.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(tx.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTypeColor(tx.type)}`}>
                    {Number(tx.amount) > 0 ? "+" : ""}
                    {Number(tx.amount).toFixed(0)} PKR
                  </p>
                  <span className={`text-xs ${tx.status === "completed" ? "text-[#00FF88]" : "text-yellow-500"}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-gray-400">No transactions yet</p>
        )}
      </div>
    </div>
  );

  // ✅ Wrap with UserShell to show sidebar menu
  return <UserShell username={user.username}>{content}</UserShell>;
}