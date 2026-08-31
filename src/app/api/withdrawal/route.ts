import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { withdrawals, transactions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// ✅ Mapping: frontend method IDs → database display names
const methodMap: Record<string, string> = {
  easypaisa: "Easypaisa",
  "easy paisa": "Easypaisa",
  jazzcash: "JazzCash",
  "jazz cash": "JazzCash",
  opay: "OPay",
  sadapay: "SadaPay",
  bank: "All Banks",
  "all banks": "All Banks",
  allbanks: "All Banks",
};

// ✅ Allowed methods (for validation)
const validMethods = ["JazzCash", "Easypaisa", "All Banks", "OPay", "SadaPay"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method, accountDetails } = body;

    const amountNum = Number(amount);
    if (!amountNum || amountNum < 30) {
      return NextResponse.json({ error: "Minimum withdrawal is 30 PKR" }, { status: 400 });
    }

    // ✅ Normalize method (case-insensitive)
    const normalizedMethod = methodMap[method?.toLowerCase().trim()] || method;

    if (!validMethods.includes(normalizedMethod)) {
      return NextResponse.json(
        { error: `Invalid payment method. Choose one: ${validMethods.join(", ")}` },
        { status: 400 }
      );
    }

    // ✅ Check user balance
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || Number(user.balance) < amountNum) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // ✅ Convert accountDetails to string if it's an object
    let accountDetailsStr = "";
    if (typeof accountDetails === "object" && accountDetails !== null) {
      // Flatten object into a readable string
      const parts: string[] = [];
      if (accountDetails.accountHolder) parts.push(`Name: ${accountDetails.accountHolder}`);
      if (accountDetails.accountNumber) parts.push(`Account: ${accountDetails.accountNumber}`);
      if (accountDetails.bankName) parts.push(`Bank: ${accountDetails.bankName}`);
      accountDetailsStr = parts.join(" | ");
    } else if (typeof accountDetails === "string") {
      accountDetailsStr = accountDetails;
    } else {
      accountDetailsStr = "";
    }

    // ✅ Create withdrawal
    const [withdrawal] = await db
      .insert(withdrawals)
      .values({
        userId: session.user.id,
        amount: amountNum.toString(),
        method: normalizedMethod,
        accountDetails: accountDetailsStr,
        status: "pending",
      })
      .returning();

    // ✅ Deduct balance immediately
    await db
      .update(users)
      .set({
        balance: (Number(user.balance) - amountNum).toString(),
      })
      .where(eq(users.id, session.user.id));

    // ✅ Create transaction
    await db.insert(transactions).values({
      userId: session.user.id,
      type: "withdrawal",
      amount: amountNum.toString(),
      description: `Withdrawal via ${normalizedMethod} - Pending`,
      status: "pending",
      referenceId: withdrawal.id,
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal,
    });
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}