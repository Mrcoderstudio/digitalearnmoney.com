import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { withdrawals, users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNote: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = actionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { action, adminNote } = result.data;

    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: `Withdrawal has already been ${withdrawal.status}` }, { status: 400 });
    }

    const now = new Date();

    if (action === "approve") {
      await db
        .update(withdrawals)
        .set({
          status: "approved",
          adminNote: adminNote || "Funds transferred successfully",
          processedAt: now,
        })
        .where(eq(withdrawals.id, id));

      await db
        .update(transactions)
        .set({ status: "completed" })
        .where(eq(transactions.referenceId, id));

      return NextResponse.json({ message: "Withdrawal marked as approved and sent." });
    }

    // Action is reject -> Refund amount back to user's balance
    const [user] = await db.select().from(users).where(eq(users.id, withdrawal.userId)).limit(1);
    if (user) {
      const refundedBalance = (Number(user.balance) + Number(withdrawal.amount)).toFixed(2);
      await db
        .update(users)
        .set({
          balance: refundedBalance,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));

      await db.insert(transactions).values({
        userId: user.id,
        type: "refund",
        amount: withdrawal.amount,
        description: `Refund for rejected withdrawal: ${adminNote || "Rejected by admin"}`,
        status: "completed",
        referenceId: id,
      });
    }

    await db
      .update(withdrawals)
      .set({
        status: "rejected",
        adminNote: adminNote || "Withdrawal rejected",
        processedAt: now,
      })
      .where(eq(withdrawals.id, id));

    await db
      .update(transactions)
      .set({ status: "rejected" })
      .where(eq(transactions.referenceId, id));

    return NextResponse.json({ message: "Withdrawal rejected and balance refunded to user." });
  } catch (error) {
    console.error("Withdrawal action error:", error);
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 });
  }
}
