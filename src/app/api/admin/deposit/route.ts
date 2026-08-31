import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { deposits, users, transactions, plans, referrals, settings } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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

    // Update deposit status
    await db
      .update(deposits)
      .set({
        status: status,
        approvedAt: status === "approved" ? new Date() : null,
      })
      .where(eq(deposits.id, depositId));

    // ✅ If approved, update balance and process referral bonuses
    if (status === "approved") {
      const depositAmount = Number(deposit.amount);

      // 1. Update user balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, deposit.userId))
        .limit(1);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const newBalance = Number(user.balance) + depositAmount;
      await db
        .update(users)
        .set({
          balance: String(newBalance),
          totalInvested: String(Number(user.totalInvested) + depositAmount),
        })
        .where(eq(users.id, deposit.userId));

      // 2. Update transaction for deposit
      await db
        .update(transactions)
        .set({
          status: "completed",
          description: `Deposit approved - ${depositAmount} PKR`,
        })
        .where(eq(transactions.referenceId, depositId));

      // 3. ✅ Process referral bonuses (level 1 & 2)
      await processReferralBonuses(deposit.userId, depositAmount);
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

// ✅ Separate function to handle referral bonuses
async function processReferralBonuses(userId: string, depositAmount: number) {
  try {
    // Get user's referrer (level 1)
    const [user] = await db
      .select({ referredBy: users.referredBy })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.referredBy) {
      console.log("No referrer found for user:", userId);
      return;
    }

    // Get referral bonus percentages from settings
    const [settingsData] = await db
      .select({ referralLevels: settings.referralLevels })
      .from(settings)
      .limit(1);

    let level1Percent = 10;
    let level2Percent = 2;
    if (settingsData && settingsData.referralLevels) {
      const levels = settingsData.referralLevels as any;
      level1Percent = levels.level1 || 10;
      level2Percent = levels.level2 || 2;
    }

    // ----- Level 1 Referral Bonus -----
    const level1Bonus = (depositAmount * level1Percent) / 100;
    if (level1Bonus > 0) {
      // Credit level 1 referrer
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${level1Bonus}`,
          totalEarned: sql`${users.totalEarned} + ${level1Bonus}`,
        })
        .where(eq(users.id, user.referredBy));

      // Create transaction for level 1 bonus
      await db.insert(transactions).values({
        userId: user.referredBy,
        type: "referral",
        amount: level1Bonus.toString(),
        description: `Level 1 referral bonus (${level1Percent}%) from deposit of ${depositAmount} PKR`,
        status: "completed",
        referenceId: userId, // reference to the user who deposited
      });

      // Update referral record status if needed (mark as completed)
      await db
        .update(referrals)
        .set({ status: "completed" })
        .where(
          and(
            eq(referrals.referrerId, user.referredBy),
            eq(referrals.referredId, userId)
          )
        );

      console.log(`✅ Level 1 bonus ${level1Bonus} PKR credited to referrer ${user.referredBy}`);
    }

    // ----- Level 2 Referral Bonus -----
    // Get level 2 referrer (referrer of the referrer)
    const [referrer] = await db
      .select({ referredBy: users.referredBy })
      .from(users)
      .where(eq(users.id, user.referredBy))
      .limit(1);

    if (referrer && referrer.referredBy) {
      const level2Bonus = (depositAmount * level2Percent) / 100;
      if (level2Bonus > 0) {
        // Credit level 2 referrer
        await db
          .update(users)
          .set({
            balance: sql`${users.balance} + ${level2Bonus}`,
            totalEarned: sql`${users.totalEarned} + ${level2Bonus}`,
          })
          .where(eq(users.id, referrer.referredBy));

        // Create transaction for level 2 bonus
        await db.insert(transactions).values({
          userId: referrer.referredBy,
          type: "referral",
          amount: level2Bonus.toString(),
          description: `Level 2 referral bonus (${level2Percent}%) from deposit of ${depositAmount} PKR`,
          status: "completed",
          referenceId: userId,
        });

        // Update referral record (level 2) if exists
        await db
          .update(referrals)
          .set({ status: "completed" })
          .where(
            and(
              eq(referrals.referrerId, referrer.referredBy),
              eq(referrals.referredId, user.referredBy)
            )
          );

        console.log(`✅ Level 2 bonus ${level2Bonus} PKR credited to referrer ${referrer.referredBy}`);
      }
    }
  } catch (error) {
    console.error("❌ Referral bonus error:", error);
    // Don't throw to avoid failing deposit approval
  }
}
