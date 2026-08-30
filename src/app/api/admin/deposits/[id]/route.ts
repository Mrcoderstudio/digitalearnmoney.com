import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { deposits, users, plans, userPlans, transactions, referrals } from "@/db/schema";
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

    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id)).limit(1);
    if (!deposit) {
      return NextResponse.json({ error: "Deposit request not found" }, { status: 404 });
    }

    if (deposit.status !== "pending") {
      return NextResponse.json({ error: `Deposit is already ${deposit.status}` }, { status: 400 });
    }

    const now = new Date();

    if (action === "reject") {
      await db
        .update(deposits)
        .set({
          status: "rejected",
          adminNote: adminNote || "Deposit rejected by admin",
        })
        .where(eq(deposits.id, id));

      await db
        .update(transactions)
        .set({ status: "rejected" })
        .where(eq(transactions.referenceId, id));

      return NextResponse.json({ message: "Deposit rejected successfully" });
    }

    // Action is approve
    // 1. Fetch user
    const [user] = await db.select().from(users).where(eq(users.id, deposit.userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "User associated with deposit not found" }, { status: 404 });
    }

    // 2. Fetch Plan
    let selectedPlan = null;
    if (deposit.planId) {
      const [p] = await db.select().from(plans).where(eq(plans.id, deposit.planId)).limit(1);
      selectedPlan = p;
    }

    // If no plan directly linked, find closest plan by amount
    if (!selectedPlan) {
      const allPlans = await db.select().from(plans);
      selectedPlan = allPlans.find((p) => Math.abs(Number(p.amount) - Number(deposit.amount)) < 1) || allPlans[0];
    }

    // 3. Mark deposit approved
    await db
      .update(deposits)
      .set({
        status: "approved",
        adminNote: adminNote || "Verified and approved",
        approvedAt: now,
      })
      .where(eq(deposits.id, id));

    // 4. Activate User Plan (30 days duration)
    const durationDays = selectedPlan?.duration || 30;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const depositAmount = Number(deposit.amount);
    const dailyProfit = selectedPlan ? selectedPlan.dailyProfit : (depositAmount * 0.08).toFixed(2);

    if (selectedPlan) {
      await db.insert(userPlans).values({
        userId: user.id,
        planId: selectedPlan.id,
        amount: deposit.amount,
        dailyProfit: dailyProfit,
        startDate: now,
        endDate: endDate,
        totalEarned: "0.00",
        status: "active",
      });
    }

    // 5. Update user totalInvested
    const newTotalInvested = (Number(user.totalInvested) + depositAmount).toFixed(2);
    await db
      .update(users)
      .set({
        totalInvested: newTotalInvested,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    // 6. Update deposit transaction to completed
    await db
      .update(transactions)
      .set({
        status: "completed",
        description: `Approved deposit for ${selectedPlan?.name || "Plan"} (${deposit.paymentMethod})`,
      })
      .where(eq(transactions.referenceId, id));

    // 7. Referral Commission System (Level 1: 10%, Level 2: 2%)
    if (user.referredBy) {
      // Level 1 Referrer
      const [l1Referrer] = await db.select().from(users).where(eq(users.id, user.referredBy)).limit(1);
      if (l1Referrer && l1Referrer.status !== "blocked") {
        const l1Commission = Number((depositAmount * 0.10).toFixed(2));
        const l1NewBalance = (Number(l1Referrer.balance) + l1Commission).toFixed(2);
        const l1NewTotalEarned = (Number(l1Referrer.totalEarned) + l1Commission).toFixed(2);

        await db
          .update(users)
          .set({
            balance: l1NewBalance,
            totalEarned: l1NewTotalEarned,
            updatedAt: now,
          })
          .where(eq(users.id, l1Referrer.id));

        await db.insert(referrals).values({
          referrerId: l1Referrer.id,
          referredId: user.id,
          level: 1,
          commission: l1Commission.toFixed(2),
          status: "paid",
          paidAt: now,
        });

        await db.insert(transactions).values({
          userId: l1Referrer.id,
          type: "referral_commission",
          amount: l1Commission.toFixed(2),
          description: `Level 1 referral bonus (10%) from ${user.username}'s deposit`,
          status: "completed",
          referenceId: id,
        });

        // Level 2 Referrer (if Level 1 was referred by someone)
        if (l1Referrer.referredBy) {
          const [l2Referrer] = await db.select().from(users).where(eq(users.id, l1Referrer.referredBy)).limit(1);
          if (l2Referrer && l2Referrer.status !== "blocked") {
            const l2Commission = Number((depositAmount * 0.02).toFixed(2));
            const l2NewBalance = (Number(l2Referrer.balance) + l2Commission).toFixed(2);
            const l2NewTotalEarned = (Number(l2Referrer.totalEarned) + l2Commission).toFixed(2);

            await db
              .update(users)
              .set({
                balance: l2NewBalance,
                totalEarned: l2NewTotalEarned,
                updatedAt: now,
              })
              .where(eq(users.id, l2Referrer.id));

            await db.insert(referrals).values({
              referrerId: l2Referrer.id,
              referredId: user.id,
              level: 2,
              commission: l2Commission.toFixed(2),
              status: "paid",
              paidAt: now,
            });

            await db.insert(transactions).values({
              userId: l2Referrer.id,
              type: "referral_commission",
              amount: l2Commission.toFixed(2),
              description: `Level 2 referral bonus (2%) from ${user.username}'s deposit`,
              status: "completed",
              referenceId: id,
            });
          }
        }
      }
    }

    return NextResponse.json({
      message: "Deposit approved successfully, plan activated, and referral commissions credited.",
    });
  } catch (error) {
    console.error("Deposit action error:", error);
    return NextResponse.json({ error: "Failed to process deposit action" }, { status: 500 });
  }
}
