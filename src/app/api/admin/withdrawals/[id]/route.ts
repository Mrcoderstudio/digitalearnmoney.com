import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { withdrawals, transactions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// ✅ GET - Fetch single withdrawal
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is a Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;  // ✅ Await params

    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, id))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error("Fetch withdrawal error:", error);
    return NextResponse.json({ error: "Failed to fetch withdrawal" }, { status: 500 });
  }
}

// ✅ PUT - Approve/Reject withdrawal
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is a Promise
) {
  try {
    console.log("🔍 Admin withdrawal PUT request received");

    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      console.log("❌ Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: withdrawalId } = await params;  // ✅ Await params
    console.log("✅ Withdrawal ID:", withdrawalId);

    const body = await req.json();
    const { status, adminNote } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // ✅ Get withdrawal
    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, withdrawalId))
      .limit(1);

    if (!withdrawal) {
      console.log("❌ Withdrawal not found:", withdrawalId);
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    // ✅ Update withdrawal
    await db
      .update(withdrawals)
      .set({
        status: status,
        adminNote: adminNote || null,
        processedAt: status === "approved" ? new Date() : null,
      })
      .where(eq(withdrawals.id, withdrawalId));

    // ✅ If rejected, refund balance
    if (status === "rejected") {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, withdrawal.userId))
        .limit(1);
      if (user) {
        const refundedBalance = Number(user.balance) + Number(withdrawal.amount);
        await db
          .update(users)
          .set({ balance: String(refundedBalance) })
          .where(eq(users.id, withdrawal.userId));
        console.log("✅ Balance refunded:", refundedBalance);
      }
      await db
        .update(transactions)
        .set({
          status: "failed",
          description: `Withdrawal rejected - ${withdrawal.amount} PKR`,
        })
        .where(eq(transactions.referenceId, withdrawalId));
    }

    // ✅ If approved, update transaction
    if (status === "approved") {
      await db
        .update(transactions)
        .set({
          status: "completed",
          description: `Withdrawal approved - ${withdrawal.amount} PKR via ${withdrawal.method}`,
        })
        .where(eq(transactions.referenceId, withdrawalId));
      console.log("✅ Transaction marked as completed");
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
    });
  } catch (error: any) {
    console.error("❌ Update withdrawal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update withdrawal" },
      { status: 500 }
    );
  }
}