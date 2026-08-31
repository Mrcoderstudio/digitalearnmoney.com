import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { deposits, users, transactions, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { depositId, status } = body;
    if (!depositId) {
      return NextResponse.json({ error: "Deposit ID is required" }, { status: 400 });
    }

    const [deposit] = await db
      .select()
      .from(deposits)
      .where(eq(deposits.id, depositId))
      .limit(1);
    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    await db
      .update(deposits)
      .set({
        status: status,
        approvedAt: status === "approved" ? new Date() : null,
      })
      .where(eq(deposits.id, depositId));

    // ✅ SIRF BALANCE UPDATE (Total Invested mat badhao)
    if (status === "approved") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, deposit.userId))
        .limit(1);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // ✅ Sirf balance add karo, totalInvested nahi
      const newBalance = Number(user.balance) + Number(deposit.amount);

      await db
        .update(users)
        .set({
          balance: String(newBalance),
          // totalInvested: String(newTotalInvested), // ✅ Comment out karo
        })
        .where(eq(users.id, deposit.userId));

      console.log(`✅ Balance updated: ${user.balance} → ${newBalance}`);

      await db
        .update(transactions)
        .set({
          status: "completed",
          description: `Deposit approved - ${deposit.amount} PKR`,
        })
        .where(eq(transactions.referenceId, depositId));
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