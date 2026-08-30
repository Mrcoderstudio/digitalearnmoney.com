import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { deposits, users, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = db
      .select({
        id: deposits.id,
        userId: deposits.userId,
        amount: deposits.amount,
        paymentMethod: deposits.paymentMethod,
        senderName: deposits.senderName,
        transactionId: deposits.transactionId,
        screenshot: deposits.screenshot,
        status: deposits.status,
        adminNote: deposits.adminNote,
        approvedAt: deposits.approvedAt,
        createdAt: deposits.createdAt,
        userName: users.username,
        userEmail: users.email,
        planId: deposits.planId,
        planName: plans.name,
        planDailyProfit: plans.dailyProfit,
      })
      .from(deposits)
      .leftJoin(users, eq(deposits.userId, users.id))
      .leftJoin(plans, eq(deposits.planId, plans.id))
      .orderBy(desc(deposits.createdAt));

    const list = await query;
    const filtered = status && status !== "all"
      ? list.filter((d) => d.status === status)
      : list;

    return NextResponse.json({ deposits: filtered });
  } catch (error) {
    console.error("Admin deposits fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch deposits" }, { status: 500 });
  }
}
