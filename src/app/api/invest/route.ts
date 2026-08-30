import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { userPlans, users, transactions, plans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // ✅ Get plan details
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // ✅ Check if user has enough balance
    if (Number(user.balance) < Number(plan.price)) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // ✅ Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // ✅ Create user_plan
    const [userPlan] = await db
      .insert(userPlans)
      .values({
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        dailyProfit: plan.dailyProfit,
        startDate: new Date(),
        endDate: endDate,
        totalEarned: "0",
        status: "active",
      })
      .returning();

    // ✅ Deduct balance
    const newBalance = Number(user.balance) - Number(plan.price);
    await db
      .update(users)
      .set({ balance: String(newBalance) })
      .where(eq(users.id, user.id));

    // ✅ Create transaction
    await db.insert(transactions).values({
      userId: user.id,
      type: "investment",
      amount: plan.price,
      status: "completed",
      description: `Invested in ${plan.name} plan`,
      referenceId: userPlan.id,
    });

    return NextResponse.json({
      success: true,
      message: "Plan activated successfully",
      plan: userPlan,
    });
  } catch (error: any) {
    console.error("❌ Investment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to invest" },
      { status: 500 }
    );
  }
}
