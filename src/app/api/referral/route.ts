import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users, referrals } from "@/db/schema";
import { eq, inArray, desc, sql, and } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get Level 1 Users (referredBy == user.id)
    const level1Users = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        totalInvested: users.totalInvested,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.referredBy, user.id))
      .orderBy(desc(users.createdAt));

    const level1UserIds = level1Users.map((u) => u.id);

    // 2. Get Level 2 Users (referredBy in level1UserIds)
    let level2Users: Array<{
      id: string;
      username: string;
      email: string;
      totalInvested: string;
      createdAt: Date;
      referredBy: string | null;
    }> = [];

    if (level1UserIds.length > 0) {
      level2Users = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          totalInvested: users.totalInvested,
          createdAt: users.createdAt,
          referredBy: users.referredBy,
        })
        .from(users)
        .where(inArray(users.referredBy, level1UserIds))
        .orderBy(desc(users.createdAt));
    }

    // 3. Get Commissions Breakdown
    const commissions = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, user.id))
      .orderBy(desc(referrals.createdAt));

    const level1CommissionSum = await db
      .select({ total: sql<string>`coalesce(sum(${referrals.commission}), 0)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, user.id), eq(referrals.level, 1)));

    const level2CommissionSum = await db
      .select({ total: sql<string>`coalesce(sum(${referrals.commission}), 0)` })
      .from(referrals)
      .where(and(eq(referrals.referrerId, user.id), eq(referrals.level, 2)));

    const level1Earnings = Number(level1CommissionSum[0]?.total || 0);
    const level2Earnings = Number(level2CommissionSum[0]?.total || 0);

    return NextResponse.json({
      referralCode: user.referralCode,
      level1Members: level1Users,
      level2Members: level2Users,
      level1Earnings,
      level2Earnings,
      totalCommission: level1Earnings + level2Earnings,
      commissionsLog: commissions,
    });
  } catch (error) {
    console.error("Referral fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 });
  }
}
