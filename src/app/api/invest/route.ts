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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
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

    // ✅ Get user from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Check balance (Note: Agar price column amount hai toh plan.amount use karo)
    if (Number(dbUser.balance) < Number(plan.price)) {
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
        userId: dbUser.id,
        planId: plan.id,
        amount: plan.price, // Agar price column nahi hai toh plan.amount karo
        dailyProfit: plan.dailyProfit,
        startDate: new Date(),
        endDate: endDate,
        totalEarned: "0",
        status: "active",
      })
      .returning();

    // ✅ Deduct balance
    const newBalance = Number(dbUser.balance) - Number(plan.price);
    await db
      .update(users)
      .set({ balance: String(newBalance) })
      .where(eq(users.id, dbUser.id));

    // ✅ Create transaction (referenceId hata diya hai taake error na aaye)
    await db.insert(transactions).values({
      userId: dbUser.id,
      type: "investment",
      amount: plan.price,
      status: "completed",
      description: `Invested in ${plan.name} plan`,
      // referenceId: userPlan.id,  // 👈 Comment out kiya (agar column nahi hai)
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
