import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { userPlans, users, transactions, plans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId, planName } = body;

    console.log("📥 Invest request:", { planId, planName });

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // ✅ Try to find plan by UUID
    let [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    // ✅ If not found and planName is provided, try by name
    if (!plan && planName) {
      console.log("🔍 Plan not found by ID, searching by name:", planName);
      [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.name, planName))
        .limit(1);
    }

    // ✅ Fallback: numeric ID mapping (Plan 1 → "1")
    if (!plan) {
      const numericId = parseInt(planId);
      if (!isNaN(numericId) && numericId >= 1 && numericId <= 10) {
        console.log(`🔍 Searching by numeric fallback: Plan ${numericId}`);
        [plan] = await db
          .select()
          .from(plans)
          .where(eq(plans.name, `Plan ${numericId}`))
          .limit(1);
      }
    }

    if (!plan) {
      console.error("❌ Plan not found for:", { planId, planName });
      return NextResponse.json(
        { error: "Plan not found. Please refresh the page and try again." },
        { status: 404 }
      );
    }

    console.log("✅ Plan found:", plan.name, plan.id);

    // ✅ Get user
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userBalance = Number(dbUser.balance);
    const planAmount = Number(plan.amount);

    if (userBalance < planAmount) {
      return NextResponse.json(
        {
          error: `Insufficient balance! Need PKR ${planAmount.toLocaleString()}, have PKR ${userBalance.toLocaleString()}. Please deposit first.`,
          code: "INSUFFICIENT_BALANCE"
        },
        { status: 400 }
      );
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const [userPlan] = await db
      .insert(userPlans)
      .values({
        userId: dbUser.id,
        planId: plan.id,
        amount: plan.amount,
        dailyProfit: plan.dailyProfit,
        startDate: new Date(),
        endDate: endDate,
        totalEarned: "0",
        status: "active",
      })
      .returning();

    const newBalance = userBalance - planAmount;
    const newTotalInvested = Number(dbUser.totalInvested) + planAmount;

    await db
      .update(users)
      .set({
        balance: String(newBalance),
        totalInvested: String(newTotalInvested),
      })
      .where(eq(users.id, dbUser.id));

    await db.insert(transactions).values({
      userId: dbUser.id,
      type: "investment",
      amount: plan.amount,
      status: "completed",
      description: `Invested in ${plan.name} plan`,
      referenceId: userPlan.id,
    });

    return NextResponse.json({
      success: true,
      message: `🎉 ${plan.name} activated successfully! Daily profit of PKR ${Number(plan.dailyProfit).toLocaleString()} will start from tomorrow.`,
      plan: userPlan,
      remainingBalance: newBalance,
    });
  } catch (error: any) {
    console.error("❌ Investment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to invest. Please try again." },
      { status: 500 }
    );
  }
}