import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  status: z.enum(["active", "blocked"]).optional(),
  role: z.enum(["user", "admin"]).optional(),
  balance: z.number().optional(),
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
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (result.data.status) {
      updateData.status = result.data.status;
    }
    if (result.data.role) {
      updateData.role = result.data.role;
    }
    if (result.data.balance !== undefined) {
      const oldBalance = Number(existing.balance);
      const newBal = result.data.balance;
      updateData.balance = newBal.toFixed(2);

      // Log transaction if balance adjusted
      const diff = newBal - oldBalance;
      if (Math.abs(diff) > 0.001) {
        await db.insert(transactions).values({
          userId: id,
          type: diff > 0 ? "deposit" : "withdrawal",
          amount: Math.abs(diff).toFixed(2),
          description: `Admin balance adjustment (${diff > 0 ? "+" : "-"}${Math.abs(diff).toFixed(2)} PKR)`,
          status: "completed",
        });
      }
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json({
      message: "User updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
