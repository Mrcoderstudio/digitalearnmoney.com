import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, referrals, transactions, settings } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional().or(z.literal("")),
});

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DEM";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { username, email, password, referralCode } = result.data;
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if email or username already taken
    const existing = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(or(eq(users.email, cleanEmail), eq(users.username, cleanUsername)))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].email === cleanEmail) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
      }
      if (existing[0].username === cleanUsername) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    let referredById: string | null = null;
    let referralBonus = 0;

    // ✅ Handle referral code
    if (referralCode && referralCode.trim() !== "") {
      const cleanRef = referralCode.trim().toUpperCase();
      const [referrer] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, cleanRef))
        .limit(1);

      if (referrer) {
        referredById = referrer.id;

        // ✅ Get referral bonus from settings
        const [settingsData] = await db
          .select({ referralLevels: settings.referralLevels })
          .from(settings)
          .limit(1);

        if (settingsData && settingsData.referralLevels) {
          const levels = settingsData.referralLevels as any;
          referralBonus = levels.level1 || 10;
        } else {
          referralBonus = 10;
        }
      } else {
        return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
      }
    }

    // Generate unique referral code
    let newRefCode = generateReferralCode();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const codeCheck = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, newRefCode))
        .limit(1);
      if (codeCheck.length === 0) {
        isUnique = true;
      } else {
        newRefCode = generateReferralCode();
        attempts++;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        referralCode: newRefCode,
        referredBy: referredById,
        role: "user",
        status: "active",
        balance: "0.00",
        totalEarned: "0.00",
        totalInvested: "0.00",
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        referralCode: users.referralCode,
      });

    // ✅ If referred by someone, create referral record with pending status
    if (referredById) {
      await db.insert(referrals).values({
        referrerId: referredById,
        referredId: newUser.id,
        level: 1,
        commission: "0.00", // Bonus will be calculated on deposit
        status: "pending", // ✅ pending until first deposit
      });
    }

    return NextResponse.json({
      message: "Account created successfully",
      user: newUser,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register account" }, { status: 500 });
  }
}
