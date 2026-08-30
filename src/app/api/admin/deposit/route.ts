import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { deposits, userPlans, users, transactions, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// ✅ GET - Fetch all deposits
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allDeposits = await db
      .select({
        id: deposits.id,
        userId: deposits.userId,
        amount: deposits.amount,
        screenshot: deposits.screenshot,
        paymentMethod: deposits.paymentMethod,
        status: deposits.status,
        adminNote: deposits.adminNote,
        approvedAt: deposits.approvedAt,
        createdAt: deposits.createdAt,
        username: users.username,
        email: users.email,
        planName: plans.name,
      })
      .from(deposits)
      .leftJoin(users, eq(deposits.userId, users.id))
      .leftJoin(plans, eq(deposits.planId, plans.id))
      .orderBy(desc(deposits.createdAt));

    return NextResponse.json(allDeposits);
  } catch (error) {
    console.error("Fetch deposits error:", error);
    return NextResponse.json([]);
  }
}

// ✅ PUT - Approve/Reject Deposit
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { depositId, status } = body;

    console.log(`📥 Admin ${status}ing deposit:`, depositId);

    if (!depositId) {
      return NextResponse.json({ error: "Deposit ID is required" }, { status: 400 });
    }

    // ✅ Get deposit with plan details
    const [deposit] = await db
      .select()
      .from(deposits)
      .where(eq(deposits.id, depositId))
      .limit(1);

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    console.log("✅ Deposit found:", deposit.id, "Status:", deposit.status);

    // ✅ Update deposit status
    await db
      .update(deposits)
      .set({
        status: status,
        approvedAt: status === "approved" ? new Date() : null,
      })
      .where(eq(deposits.id, depositId));

    console.log(`✅ Deposit ${status}ed`);

    // ✅ If approved, create user plan
    if (status === "approved") {
      console.log("🔍 Creating user plan for deposit:", deposit.id);

      // ✅ Get plan details
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, deposit.planId))
        .limit(1);

      if (!plan) {
        console.error("❌ Plan not found for deposit:", deposit.planId);
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      console.log("✅ Plan found:", plan.name);

      // ✅ Calculate end date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      // ✅ Create user_plan
      const [userPlan] = await db
        .insert(userPlans)
        .values({
          userId: deposit.userId,
          planId: deposit.planId,
          amount: deposit.amount,
          dailyProfit: plan.dailyProfit,
          startDate: new Date(),
          endDate: endDate,
          totalEarned: "0",
          status: "active",
        })
        .returning();

      console.log("✅ User plan created:", userPlan.id);

      // ✅ Update user total invested
      await db
        .update(users)
        .set({
          totalInvested: deposit.amount,
        })
        .where(eq(users.id, deposit.userId));

      // ✅ Update transaction status
      await db
        .update(transactions)
        .set({
          status: "completed",
          description: `Deposit approved - ${deposit.amount} PKR`,
        })
        .where(eq(transactions.referenceId, depositId));

      console.log("✅ All updates completed for deposit:", depositId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Deposit approval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process deposit" },
      { status: 500 }
    );
  }
}