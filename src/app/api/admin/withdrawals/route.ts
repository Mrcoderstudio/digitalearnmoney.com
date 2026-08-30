import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const list = await db
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
        userName: users.username,
        userEmail: users.email,
        userBalance: users.balance,
      })
      .from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id))
      .orderBy(desc(withdrawals.createdAt));

    const filtered = status && status !== "all"
      ? list.filter((w) => w.status === status)
      : list;

    return NextResponse.json({ withdrawals: filtered });
  } catch (error) {
    console.error("Admin withdrawals fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}
