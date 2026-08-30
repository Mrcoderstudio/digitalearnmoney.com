import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { deposits, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
      .select({
        id: deposits.id,
        amount: deposits.amount,
        paymentMethod: deposits.paymentMethod,
        senderName: deposits.senderName,
        transactionId: deposits.transactionId,
        screenshot: deposits.screenshot,
        status: deposits.status,
        adminNote: deposits.adminNote,
        approvedAt: deposits.approvedAt,
        createdAt: deposits.createdAt,
        planName: plans.name,
      })
      .from(deposits)
      .leftJoin(plans, eq(deposits.planId, plans.id))
      .where(eq(deposits.userId, user.id))
      .orderBy(desc(deposits.createdAt));

    return NextResponse.json({ deposits: history });
  } catch (error) {
    console.error("Deposit history error:", error);
    return NextResponse.json({ error: "Failed to fetch deposit history" }, { status: 500 });
  }
}
