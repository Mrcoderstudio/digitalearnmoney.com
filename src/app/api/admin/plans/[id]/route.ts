import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updatePlanSchema = z.object({
  name: z.string().min(2).optional(),
  amount: z.number().positive().optional(),
  dailyProfit: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  totalProfit: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
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
    const result = updatePlanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const updateValues: Partial<typeof plans.$inferInsert> = {};
    if (result.data.name !== undefined) updateValues.name = result.data.name;
    if (result.data.amount !== undefined) updateValues.amount = result.data.amount.toFixed(2);
    if (result.data.dailyProfit !== undefined) updateValues.dailyProfit = result.data.dailyProfit.toFixed(2);
    if (result.data.duration !== undefined) updateValues.duration = result.data.duration;
    if (result.data.totalProfit !== undefined) updateValues.totalProfit = result.data.totalProfit.toFixed(2);
    if (result.data.isActive !== undefined) updateValues.isActive = result.data.isActive;
    if (result.data.sortOrder !== undefined) updateValues.sortOrder = result.data.sortOrder;

    const [updated] = await db
      .update(plans)
      .set(updateValues)
      .where(eq(plans.id, id))
      .returning();

    return NextResponse.json({ message: "Plan updated successfully", plan: updated });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
