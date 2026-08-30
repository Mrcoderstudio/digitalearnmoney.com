import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: Number(user.balance),
        totalEarned: Number(user.totalEarned),
        totalInvested: Number(user.totalInvested),
        referralCode: user.referralCode,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const cleanUsername = result.data.username.trim().toLowerCase();

    // Check if username already used by another user
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, cleanUsername), not(eq(users.id, user.id))))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        username: cleanUsername,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      message: "Profile updated successfully",
      username: cleanUsername,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
