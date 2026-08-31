import { db } from "./index";
import { users, plans, settings } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  // ============================================
  // 1. Seed Plans (10 plans — 150 to 10000)
  // ============================================
  const existingPlans = await db.select().from(plans);
  if (existingPlans.length === 0) {
    const defaultPlans = [
      {
        name: "Plan 1",
        amount: "150.00",
        dailyProfit: "30.00",
        duration: 10,
        totalProfit: "300.00",
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "Plan 2",
        amount: "350.00",
        dailyProfit: "50.00",
        duration: 15,
        totalProfit: "750.00",
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "Plan 3",
        amount: "640.00",
        dailyProfit: "80.00",
        duration: 30,
        totalProfit: "2400.00",
        sortOrder: 3,
        isActive: true,
      },
      {
        name: "Plan 4",
        amount: "940.00",
        dailyProfit: "120.00",
        duration: 30,
        totalProfit: "3600.00",
        sortOrder: 4,
        isActive: true,
      },
      {
        name: "Plan 5",
        amount: "1700.00",
        dailyProfit: "300.00",
        duration: 30,
        totalProfit: "9000.00",
        sortOrder: 5,
        isActive: true,
      },
      {
        name: "Plan 6",
        amount: "3000.00",
        dailyProfit: "600.00",
        duration: 30,
        totalProfit: "18000.00",
        sortOrder: 6,
        isActive: true,
      },
      {
        name: "Plan 7",
        amount: "4000.00",
        dailyProfit: "740.00",
        duration: 30,
        totalProfit: "22200.00",
        sortOrder: 7,
        isActive: true,
      },
      {
        name: "Plan 8",
        amount: "5000.00",
        dailyProfit: "900.00",
        duration: 40,
        totalProfit: "36000.00",
        sortOrder: 8,
        isActive: true,
      },
      {
        name: "Plan 9",
        amount: "8000.00",
        dailyProfit: "1700.00",
        duration: 90,
        totalProfit: "153000.00",
        sortOrder: 9,
        isActive: true,
      },
      {
        name: "Plan 10",
        amount: "10000.00",
        dailyProfit: "2400.00",
        duration: 90,
        totalProfit: "216000.00",
        sortOrder: 10,
        isActive: true,
      },
    ];

    await db.insert(plans).values(defaultPlans);
    console.log("✅ Seeded 10 plans (150 to 10000).");
  } else {
    console.log("ℹ️ Plans already exist, skipping...");
  }

  // ============================================
  // 2. Seed Settings
  // ============================================
  const existingSettings = await db.select().from(settings);
  if (existingSettings.length === 0) {
    await db.insert(settings).values({
      siteName: "Digital Earn Money",
      siteLogo: null,
      favicon: null,
      easypaisaName: "Mohammed Younas",
      easypaisaNumber: "03292993220",
      minDeposit: "150.00",
      minWithdrawal: "30.00",
      referralLevels: { level1: 10, level2: 2 },
      whatsappNumber: "03276376052",
      whatsappChannelLink: "https://whatsapp.com/channel/0029VbE1E4jC6Zvj8sD3qU0U",
    });
    console.log("✅ Seeded default settings.");
  } else {
    console.log("ℹ️ Settings already exist, skipping...");
  }

  // ============================================
  // 3. Seed Admin (mrcoder@gmail.com / 11223344)
  // ============================================
  const adminEmail = "mrcoder@gmail.com";
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail));

  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash("11223344", 10);
    await db.insert(users).values({
      username: "mrcoder",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      status: "active",
      referralCode: "ADMIN001",
      balance: "0.00",
      totalEarned: "0.00",
      totalInvested: "0.00",
      totalDeposits: "0.00",
      totalWithdrawals: "0.00",
    });
    console.log("✅ Seeded admin (mrcoder@gmail.com / 11223344).");
  } else {
    console.log("ℹ️ Admin already exists, skipping...");
  }

  // ============================================
  // ❌ Demo User Removed
  // ============================================
}

// ✅ Auto-execute if run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seed completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}