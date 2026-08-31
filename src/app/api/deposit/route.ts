import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { deposits, transactions } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, paymentMethod, senderName, transactionId, screenshot } = body;

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

    // ✅ Insert deposit (planId omitted)
    const [deposit] = await db
      .insert(deposits)
      .values({
        userId: session.user.id,
        amount: amountNum.toString(),
        screenshot: screenshot,
        paymentMethod: paymentMethod || "easypaisa",
        senderName: senderName,
        transactionId: transactionId,
        status: "pending",
      })
      .returning();

    await db.insert(transactions).values({
      userId: session.user.id,
      type: "deposit",
      amount: amountNum.toString(),
      description: `Deposit request - ${amountNum} PKR - Pending approval`,
      status: "pending",
      referenceId: deposit.id,
    });

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
