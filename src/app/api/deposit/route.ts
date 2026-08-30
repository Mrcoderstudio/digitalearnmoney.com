import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { deposits, plans, transactions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const depositSchema = z.object({
  planId: z.string().uuid("Invalid plan selected"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["JazzCash", "Easypaisa", "All Banks"]),
  senderName: z.string().min(2, "Sender name is required"),
  transactionId: z.string().min(4, "Transaction ID is required"),
  screenshot: z.string().min(10, "Screenshot proof is required"),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = depositSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { planId, amount, paymentMethod, senderName, transactionId, screenshot } = result.data;

    // Verify plan exists
    const [selectedPlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!selectedPlan || !selectedPlan.isActive) {
      return NextResponse.json({ error: "Selected plan is not available" }, { status: 400 });
    }

    const planAmount = Number(selectedPlan.amount);
    if (Math.abs(amount - planAmount) > 0.01) {
      return NextResponse.json({
        error: `Deposit amount must match plan price: ${planAmount} PKR`,
      }, { status: 400 });
    }

    // Check minimum deposit setting
    const [currentSettings] = await db.select().from(settings).limit(1);
    const minDeposit = Number(currentSettings?.minDeposit || 140);
    if (amount < minDeposit) {
      return NextResponse.json({
        error: `Minimum deposit amount is ${minDeposit} PKR`,
      }, { status: 400 });
    }

    // Create deposit
    const [newDeposit] = await db
      .insert(deposits)
      .values({
        userId: user.id,
        planId: selectedPlan.id,
        amount: amount.toFixed(2),
        paymentMethod,
        senderName: senderName.trim(),
        transactionId: transactionId.trim(),
        screenshot,
        status: "pending",
      })
      .returning();

    // Create pending transaction log
    await db.insert(transactions).values({
      userId: user.id,
      type: "deposit",
      amount: amount.toFixed(2),
      description: `Deposit request for ${selectedPlan.name} via ${paymentMethod} (Tx ID: ${transactionId})`,
      status: "pending",
      referenceId: newDeposit.id,
    });

    return NextResponse.json({
      message: "Deposit submitted successfully! It will be verified by admin shortly.",
      deposit: newDeposit,
    }, { status: 201 });
  } catch (error) {
    console.error("Deposit submission error:", error);
    return NextResponse.json({ error: "Failed to submit deposit" }, { status: 500 });
  }
}
