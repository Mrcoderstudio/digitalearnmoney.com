import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, userPlans, rewards, transactions } from "@/db/schema";
import { eq, and, lt, gte, sql } from "drizzle-orm";

export async function GET(req: Request) {
  return processRewards(req);
}

export async function POST(req: Request) {
  return processRewards(req);
}

async function processRewards(req: Request) {
  try {
    // 🔒 Security check (for production)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === "development";

    if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // "2026-09-03"

    // ✅ 1. Expire plans jinki endDate < today
    const expiredPlans = await db
      .update(userPlans)
      .set({ status: "completed" })
      .where(
        and(
          eq(userPlans.status, "active"),
          lt(userPlans.endDate, today)
        )
      )
      .returning({ id: userPlans.id });

    console.log(`⏰ Expired ${expiredPlans.length} plans.`);

    // ✅ 2. Get all active plans (endDate >= today)
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
      // ✅ 3. Check if reward already credited today (prevent duplicate)
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

      if (existingReward.length > 0) {
        console.log(`⏩ Reward already credited for plan ${plan.id} today.`);
        continue;
      }

      const profitAmount = Number(plan.dailyProfit);

      // ✅ 4. Credit reward to user
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${profitAmount}`,
          totalEarned: sql`${users.totalEarned} + ${profitAmount}`,
        })
        .where(eq(users.id, plan.userId));

      // ✅ 5. Update plan's total earned
      await db
        .update(userPlans)
        .set({
          totalEarned: sql`${userPlans.totalEarned} + ${profitAmount}`,
        })
        .where(eq(userPlans.id, plan.id));

      // ✅ 6. Insert reward record
      await db.insert(rewards).values({
        userId: plan.userId,
        userPlanId: plan.id,
        amount: profitAmount.toString(),
        date: todayStr,
        status: "credited",
      });

      // ✅ 7. Insert transaction
      await db.insert(transactions).values({
        userId: plan.userId,
        type: "reward",
        amount: profitAmount.toString(),
        description: `Daily profit for ${plan.amount} PKR plan`,
        status: "completed",
        referenceId: plan.id,
      });

      creditedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `✅ Rewards processed: ${creditedCount} plans credited, ${expiredPlans.length} plans expired.`,
      credited: creditedCount,
      expired: expiredPlans.length,
    });
  } catch (error: any) {
    console.error("❌ Daily rewards cron error:", error);
    return NextResponse.json(
      { error: "Failed to process daily rewards", details: error.message },
      { status: 500 }
    );
  }
}
