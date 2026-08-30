import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { users, deposits, withdrawals, rewards, userPlans, plans } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Counts & sums
    const totalUsersCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const approvedDepositsSum = await db
      .select({ total: sql<string>`coalesce(sum(${deposits.amount}), 0)` })
      .from(deposits)
      .where(eq(deposits.status, "approved"));

    const pendingDeposits = await db
      .select({ count: sql<number>`count(*)` })
      .from(deposits)
      .where(eq(deposits.status, "pending"));

    const approvedWithdrawalsSum = await db
      .select({ total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)` })
      .from(withdrawals)
      .where(eq(withdrawals.status, "approved"));

    const pendingWithdrawals = await db
      .select({ count: sql<number>`count(*)` })
      .from(withdrawals)
      .where(eq(withdrawals.status, "pending"));

    const totalRewardsSum = await db
      .select({ total: sql<string>`coalesce(sum(${rewards.amount}), 0)` })
      .from(rewards);

    const activePlansCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userPlans)
      .where(eq(userPlans.status, "active"));

    // Recent items
    const recentDeposits = await db
      .select({
        id: deposits.id,
        amount: deposits.amount,
        paymentMethod: deposits.paymentMethod,
        senderName: deposits.senderName,
        transactionId: deposits.transactionId,
        status: deposits.status,
        createdAt: deposits.createdAt,
        userName: users.username,
        userEmail: users.email,
        planName: plans.name,
      })
      .from(deposits)
      .leftJoin(users, eq(deposits.userId, users.id))
      .leftJoin(plans, eq(deposits.planId, plans.id))
      .orderBy(desc(deposits.createdAt))
      .limit(5);

    const recentWithdrawals = await db
      .select({
        id: withdrawals.id,
        amount: withdrawals.amount,
        method: withdrawals.method,
        accountDetails: withdrawals.accountDetails,
        status: withdrawals.status,
        createdAt: withdrawals.createdAt,
        userName: users.username,
        userEmail: users.email,
      })
      .from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id))
      .orderBy(desc(withdrawals.createdAt))
      .limit(5);

    const recentUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        balance: users.balance,
        totalInvested: users.totalInvested,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: Number(totalUsersCount[0]?.count || 0),
        totalDeposits: Number(approvedDepositsSum[0]?.total || 0),
        pendingDepositsCount: Number(pendingDeposits[0]?.count || 0),
        totalWithdrawals: Number(approvedWithdrawalsSum[0]?.total || 0),
        pendingWithdrawalsCount: Number(pendingWithdrawals[0]?.count || 0),
        totalRewardsDistributed: Number(totalRewardsSum[0]?.total || 0),
        activePlansCount: Number(activePlansCount[0]?.count || 0),
      },
      recentDeposits,
      recentWithdrawals,
      recentUsers,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch admin dashboard stats" }, { status: 500 });
  }
}
