import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { asc } from "drizzle-orm";
import { z } from "zod";

const createPlanSchema = z.object({
  name: z.string().min(2),
  amount: z.number().positive(),
  dailyProfit: z.number().positive(),
  duration: z.number().int().positive().default(30),
  totalProfit: z.number().positive(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allPlans = await db.select().from(plans).orderBy(asc(plans.sortOrder), asc(plans.amount));
    return NextResponse.json({ plans: allPlans });
  } catch (error) {
    console.error("Admin plans error:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createPlanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const [newPlan] = await db
      .insert(plans)
      .values({
        name: result.data.name,
        amount: result.data.amount.toFixed(2),
        dailyProfit: result.data.dailyProfit.toFixed(2),
        duration: result.data.duration,
        totalProfit: result.data.totalProfit.toFixed(2),
        isActive: result.data.isActive,
        sortOrder: result.data.sortOrder,
      })
      .returning();

    return NextResponse.json({ message: "Plan created successfully", plan: newPlan }, { status: 201 });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
