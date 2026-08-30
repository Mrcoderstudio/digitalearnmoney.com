import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch all withdrawals with user details
    const allWithdrawals = await db
      .select({
        id: withdrawals.id,
        userId: withdrawals.userId,
        amount: withdrawals.amount,
        method: withdrawals.method,
        accountDetails: withdrawals.accountDetails,
        status: withdrawals.status,
        adminNote: withdrawals.adminNote,
        processedAt: withdrawals.processedAt,
        createdAt: withdrawals.createdAt,
        username: users.username,
        email: users.email,
      })
      .from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id))
      .orderBy(desc(withdrawals.createdAt));

    // ✅ Always return an array (even if empty)
    return NextResponse.json(allWithdrawals);
  } catch (error) {
    console.error("Fetch withdrawals error:", error);
    // ✅ Return empty array on error
    return NextResponse.json([]);
  }
}