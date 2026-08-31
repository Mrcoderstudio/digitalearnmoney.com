import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    // Check if initial seeding needed
    await seedDatabase().catch((e) => console.error("Seeder check warning:", e));
    return Response.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json({ ok: false, error: "Database unavailable" }, { status: 500 });
  }
}
