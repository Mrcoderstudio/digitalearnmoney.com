import { db } from "@/db";
import { plans, settings, users } from "@/db/schema";
import { asc, eq, or } from "drizzle-orm";
import { hashPassword, generateReferralCode } from "@/lib/auth";

// ============================================
// ✅ 10 PLANS (150 to 10000)
// ============================================
export const PLANS_SEED = [
  { name: "Plan 1", amount: 150, dailyProfit: 30, totalProfit: 300, duration: 10 },
  { name: "Plan 2", amount: 350, dailyProfit: 50, totalProfit: 750, duration: 15 },
  { name: "Plan 3", amount: 640, dailyProfit: 80, totalProfit: 2400, duration: 30 },
  { name: "Plan 4", amount: 940, dailyProfit: 120, totalProfit: 3600, duration: 30 },
  { name: "Plan 5", amount: 1700, dailyProfit: 300, totalProfit: 9000, duration: 30 },
  { name: "Plan 6", amount: 3000, dailyProfit: 600, totalProfit: 18000, duration: 30 },
  { name: "Plan 7", amount: 4000, dailyProfit: 740, totalProfit: 22200, duration: 30 },
  { name: "Plan 8", amount: 5000, dailyProfit: 900, totalProfit: 36000, duration: 40 },
  { name: "Plan 9", amount: 8000, dailyProfit: 1700, totalProfit: 153000, duration: 90 },
  { name: "Plan 10", amount: 10000, dailyProfit: 2400, totalProfit: 216000, duration: 90 },
];

// ============================================
// ✅ DEFAULT SETTINGS (including whatsappNumber)
// ============================================
const DEFAULT_SETTINGS = {
  siteName: "Digital Earn Money",
  siteLogo: null,
  favicon: null,
  easypaisaName: "Mohammed Younas",
  easypaisaNumber: "03292993220",
  minDeposit: "150",
  minWithdrawal: "30",
  referralLevels: {
    level1: 10,
    level2: 2,
  },
  whatsappNumber: "03292993220", // ✅ Added
  whatsappChannelLink: "https://whatsapp.com/channel/0029VbE1E4jC6Zvj8sD3qU0U",
};

// ============================================
// ✅ SEED FUNCTION
// ============================================
export async function ensureSeed() {
  // === Plans ===
  const existingPlans = await db.select().from(plans).limit(1);

  if (existingPlans.length === 0) {
    await db.insert(plans).values(
      PLANS_SEED.map((p, i) => ({
        name: p.name,
        amount: String(p.amount),
        dailyProfit: String(p.dailyProfit),
        totalProfit: String(p.totalProfit),
        duration: p.duration,
        isActive: true,
        sortOrder: i,
      }))
    );
    console.log("✅ 10 Plans seeded successfully!");
  } else {
    // Update existing plans (in case of changes)
    console.log("🔄 Updating plans...");
    await db.delete(plans);
    await db.insert(plans).values(
      PLANS_SEED.map((p, i) => ({
        name: p.name,
        amount: String(p.amount),
        dailyProfit: String(p.dailyProfit),
        totalProfit: String(p.totalProfit),
        duration: p.duration,
        isActive: true,
        sortOrder: i,
      }))
    );
    console.log("✅ Plans updated to 10 new plans!");
  }

  // === Settings ===
  const existingSettings = await db.select().from(settings).limit(1);

  if (existingSettings.length === 0) {
    await db.insert(settings).values({
      siteName: DEFAULT_SETTINGS.siteName,
      siteLogo: DEFAULT_SETTINGS.siteLogo,
      favicon: DEFAULT_SETTINGS.favicon,
      easypaisaName: DEFAULT_SETTINGS.easypaisaName,
      easypaisaNumber: DEFAULT_SETTINGS.easypaisaNumber,
      minDeposit: DEFAULT_SETTINGS.minDeposit,
      minWithdrawal: DEFAULT_SETTINGS.minWithdrawal,
      referralLevels: DEFAULT_SETTINGS.referralLevels,
      whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
      whatsappChannelLink: DEFAULT_SETTINGS.whatsappChannelLink,
    });
    console.log("✅ Settings created successfully!");
  } else {
    await db
      .update(settings)
      .set({
        siteName: DEFAULT_SETTINGS.siteName,
        easypaisaName: DEFAULT_SETTINGS.easypaisaName,
        easypaisaNumber: DEFAULT_SETTINGS.easypaisaNumber,
        minDeposit: DEFAULT_SETTINGS.minDeposit,
        minWithdrawal: DEFAULT_SETTINGS.minWithdrawal,
        referralLevels: DEFAULT_SETTINGS.referralLevels,
        whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
        whatsappChannelLink: DEFAULT_SETTINGS.whatsappChannelLink,
        updatedAt: new Date(),
      })
      .where(eq(settings.id, existingSettings[0].id));
    console.log("✅ Settings updated!");
  }

  // === Admin ===
  await ensureAdmin();
}

// ============================================
// ✅ ADMIN SEED
// ============================================
export async function ensureAdmin() {
  const email = "mrcoder@gmail.com";
  const username = "mrcoder";
  const password = "11223344";

  const existing = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, email),
        eq(users.username, username)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const hashed = await hashPassword(password);
    await db
      .update(users)
      .set({
        email: email,
        username: username,
        password: hashed,
        role: "admin",
        status: "active",
      })
      .where(eq(users.id, existing[0].id));
    console.log("✅ Admin updated successfully!");
    return;
  }

  const hashed = await hashPassword(password);
  await db.insert(users).values({
    username,
    email,
    password: hashed,
    referralCode: generateReferralCode(),
    role: "admin",
    status: "active",
    balance: "0",
    totalEarned: "0",
    totalInvested: "0",
    totalDeposits: "0",
    totalWithdrawals: "0",
  });
  console.log("✅ Admin created successfully!");
}

// ============================================
// ✅ GET FUNCTIONS
// ============================================
export async function getSettings() {
  await ensureSeed();
  const [s] = await db.select().from(settings).limit(1);
  return s;
}

export async function getPlans() {
  await ensureSeed();
  return db.select().from(plans).orderBy(asc(plans.sortOrder));
}