import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { withdrawals, users, transactions, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(["JazzCash", "Easypaisa", "All Banks"]),
  accountTitle: z.string().min(2, "Account title is required"),
  accountNumber: z.string().min(8, "Valid account/IBAN number is required"),
  bankName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = withdrawalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { amount, method, accountTitle, accountNumber, bankName } = result.data;

    // Check minimum withdrawal setting
    const [currentSettings] = await db.select().from(settings).limit(1);
    const minWithdrawal = Number(currentSettings?.minWithdrawal || 30);
    if (amount < minWithdrawal) {
      return NextResponse.json({
        error: `Minimum withdrawal amount is ${minWithdrawal} PKR`,
      }, { status: 400 });
    }

    // Check user balance
    const currentBalance = Number(user.balance);
    if (currentBalance < amount) {
      return NextResponse.json({
        error: `Insufficient balance. Available: ${currentBalance.toFixed(2)} PKR`,
      }, { status: 400 });
    }

    const newBalance = (currentBalance - amount).toFixed(2);

    // Deduct balance and create withdrawal record atomically
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values({
        userId: user.id,
        amount: amount.toFixed(2),
        method,
        accountDetails: {
          accountTitle: accountTitle.trim(),
          accountNumber: accountNumber.trim(),
          bankName: bankName ? bankName.trim() : method,
        },
        status: "pending",
      })
      .returning();

    // Update user balance
    await db
      .update(users)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Log transaction
    await db.insert(transactions).values({
      userId: user.id,
      type: "withdrawal",
      amount: amount.toFixed(2),
      description: `Withdrawal request to ${method} (${accountNumber})`,
      status: "pending",
      referenceId: newWithdrawal.id,
    });

    return NextResponse.json({
      message: "Withdrawal request submitted successfully! It will be reviewed by admin.",
      withdrawal: newWithdrawal,
      remainingBalance: Number(newBalance),
    }, { status: 201 });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: "Failed to submit withdrawal" }, { status: 500 });
  }
}
