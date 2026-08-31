import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allPlans = await db
      .select()
      .from(plans)
      .orderBy(asc(plans.sortOrder));

    // ✅ Always return an array
    return NextResponse.json(allPlans);
  } catch (error) {
    console.error("Fetch plans error:", error);
    // ✅ Return empty array on error
    return NextResponse.json([]);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, isActive } = await req.json();

    await db
      .update(plans)
      .set({ isActive })
      .where(eq(plans.id, planId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}