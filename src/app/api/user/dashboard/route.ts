import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { userPlans, plans, rewards, transactions, referrals, withdrawals } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Today's earning
    const todayRewards = await db
      .select({ total: sql<string>`coalesce(sum(${rewards.amount}), 0)` })
      .from(rewards)
      .where(and(eq(rewards.userId, user.id), sql`DATE(${rewards.createdAt}) = ${todayStr}`));

    const todayEarning = Number(todayRewards[0]?.total || 0);

    // Active plans with joined plan info
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
      .where(and(eq(userPlans.userId, user.id), eq(userPlans.status, "active")))
      .orderBy(desc(userPlans.createdAt));

    // Recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    // Referral counts
    const refCountL1 = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, user.id), eq(referrals.level, 1)));

    const refCountL2 = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, user.id), eq(referrals.level, 2)));

    // Total withdrawn
    const withdrawnSum = await db
      .select({ total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)` })
      .from(withdrawals)
      .where(and(eq(withdrawals.userId, user.id), eq(withdrawals.status, "approved")));

    const pendingWithdrawnSum = await db
      .select({ total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)` })
      .from(withdrawals)
      .where(and(eq(withdrawals.userId, user.id), eq(withdrawals.status, "pending")));

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: Number(user.balance),
        totalEarned: Number(user.totalEarned),
        totalInvested: Number(user.totalInvested),
        referralCode: user.referralCode,
        role: user.role,
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
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
