import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, user.id))
      .orderBy(desc(withdrawals.createdAt));

    return NextResponse.json({ withdrawals: history });
  } catch (error) {
    console.error("Withdrawal history error:", error);
    return NextResponse.json({ error: "Failed to fetch withdrawal history" }, { status: 500 });
  }
}
