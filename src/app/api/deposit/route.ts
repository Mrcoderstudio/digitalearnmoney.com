import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { deposits, plans, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📥 Deposit request received:", {
      planId: body.planId,
      amount: body.amount,
      hasScreenshot: !!body.screenshot,
      senderName: body.senderName,
      transactionId: body.transactionId,
    });

    const { planId, amount, paymentMethod, senderName, transactionId, screenshot } = body;

    // ✅ Validation
    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }
    if (!screenshot) {
      return NextResponse.json({ error: "Screenshot is required" }, { status: 400 });
    }
    if (!senderName || !transactionId) {
      return NextResponse.json({ error: "Sender name and transaction ID are required" }, { status: 400 });
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 150) {
      return NextResponse.json({ error: "Minimum deposit amount is 150 PKR" }, { status: 400 });
    }

    // ✅ Get plan
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    if (!plan.isActive) {
      return NextResponse.json({ error: "This plan is currently inactive" }, { status: 400 });
    }

    console.log("✅ Plan found:", plan.name);

    // ✅ Create deposit
    const [deposit] = await db
      .insert(deposits)
      .values({
        userId: session.user.id,
        planId: plan.id,
        amount: amountNum.toString(),
        screenshot: screenshot,
        paymentMethod: paymentMethod || "easypaisa",
        senderName: senderName,
        transactionId: transactionId,
        status: "pending",
      })
      .returning();

    console.log("✅ Deposit created with ID:", deposit.id);

    // ✅ Create transaction
    await db.insert(transactions).values({
      userId: session.user.id,
      type: "deposit",
      amount: amountNum.toString(),
      description: `Deposit request - ${amountNum} PKR - Pending approval`,
      status: "pending",
      referenceId: deposit.id,
    });

    console.log("✅ Transaction created");

    return NextResponse.json({
      success: true,
      message: "Deposit submitted successfully! Waiting for admin approval.",
      deposit: deposit,
    });
  } catch (error: any) {
    console.error("❌ Deposit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process deposit" },
      { status: 500 }
    );
  }
}