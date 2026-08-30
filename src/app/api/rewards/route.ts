import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { rewards, userPlans, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allRewards = await db
      .select({
        id: rewards.id,
        amount: rewards.amount,
        date: rewards.date,
        status: rewards.status,
        createdAt: rewards.createdAt,
        planName: plans.name,
        planDailyProfit: userPlans.dailyProfit,
      })
      .from(rewards)
      .leftJoin(userPlans, eq(rewards.userPlanId, userPlans.id))
      .leftJoin(plans, eq(userPlans.planId, plans.id))
      .where(eq(rewards.userId, user.id))
      .orderBy(desc(rewards.createdAt));

    return NextResponse.json({ rewards: allRewards });
  } catch (error) {
    console.error("Rewards fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }
}
