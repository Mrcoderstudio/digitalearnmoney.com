import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, userPlans, rewards, transactions } from "@/db/schema";
import { eq, and, lt, gte, sql } from "drizzle-orm";

// ✅ GET method for manual testing (browser)
export async function GET(req: Request) {
  return processRewards(req);
}

// ✅ POST method for Vercel Cron Jobs
export async function POST(req: Request) {
  return processRewards(req);
}

async function processRewards(req: Request) {
  try {
    // ✅ Security: Check cron secret (optional)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // "2026-08-31"

    // Get all active user plans where endDate >= today
    const activePlans = await db
      .select()
      .from(userPlans)
      .where(
        and(
          eq(userPlans.status, "active"),
          gte(userPlans.endDate, today)
        )
      );

    let creditedCount = 0;

    for (const plan of activePlans) {
      // Check if reward already credited today for this plan
      const existingReward = await db
        .select()
        .from(rewards)
        .where(
          and(
            eq(rewards.userPlanId, plan.id),
            sql`DATE(${rewards.date}) = ${todayStr}`
          )
        )
        .limit(1);

      if (existingReward.length > 0) continue;

      // Credit daily profit
      const profitAmount = Number(plan.dailyProfit);

      // Update user balance and total_earned
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${profitAmount}`,
          totalEarned: sql`${users.totalEarned} + ${profitAmount}`,
        })
        .where(eq(users.id, plan.userId));

      // Update user_plan total_earned
      await db
        .update(userPlans)
        .set({
          totalEarned: sql`${userPlans.totalEarned} + ${profitAmount}`,
        })
        .where(eq(userPlans.id, plan.id));

      // Create reward entry
      await db.insert(rewards).values({
        userId: plan.userId,
        userPlanId: plan.id,
        amount: profitAmount.toString(),
        date: todayStr,
        status: "credited",
      });

      // Create transaction record
      await db.insert(transactions).values({
        userId: plan.userId,
        type: "reward",
        amount: profitAmount.toString(),
        description: `Daily reward for ${plan.amount} PKR plan`,
        status: "completed",
        referenceId: plan.id,
      });

      creditedCount++;
    }

    // Mark expired plans as completed (endDate < today)
    await db
      .update(userPlans)
      .set({ status: "completed" })
      .where(
        and(
          eq(userPlans.status, "active"),
          lt(userPlans.endDate, today)
        )
      );

    return NextResponse.json({
      success: true,
      message: `Rewards processed successfully. Credited: ${creditedCount} plans.`,
      credited: creditedCount,
    });
  } catch (error: any) {
    console.error("Daily rewards cron error:", error);
    return NextResponse.json(
      { error: "Failed to process daily rewards", details: error.message },
      { status: 500 }
    );
  }
}