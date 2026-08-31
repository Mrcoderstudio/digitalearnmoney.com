import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get referral counts
    const level1Count = await db
      .select({ count: referrals.id })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 1)));

    const level2Count = await db
      .select({ count: referrals.id })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 2)));

    // Get total bonus earned from referrals
    const [user] = await db
      .select({ totalEarned: users.totalEarned })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Generate referral link
    const [userData] = await db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const referralLink = `${baseUrl}/register?ref=${userData?.referralCode || ""}`;

    return NextResponse.json({
      level1Count: level1Count.length,
      level2Count: level2Count.length,
      totalBonus: Number(user?.totalEarned || 0),
      referralLink,
    });
  } catch (error) {
    console.error("Referral API error:", error);
    return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 });
  }
}
