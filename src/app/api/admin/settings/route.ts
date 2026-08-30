import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [setting] = await db.select().from(settings).limit(1);
  return NextResponse.json(setting || {});
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const [existing] = await db.select().from(settings).limit(1);

  const updateData: any = {};

  if (body.siteName !== undefined) updateData.siteName = body.siteName;
  if (body.easypaisaName !== undefined) updateData.easypaisaName = body.easypaisaName;
  if (body.easypaisaNumber !== undefined) updateData.easypaisaNumber = body.easypaisaNumber;
  if (body.minDeposit !== undefined) updateData.minDeposit = Number(body.minDeposit);
  if (body.minWithdrawal !== undefined) updateData.minWithdrawal = Number(body.minWithdrawal);
  if (body.referralLevels !== undefined) updateData.referralLevels = body.referralLevels;
  if (body.whatsappNumber !== undefined) updateData.whatsappNumber = body.whatsappNumber;
  if (body.whatsappChannelLink !== undefined) updateData.whatsappChannelLink = body.whatsappChannelLink;

  if (existing) {
    await db.update(settings).set(updateData).where(eq(settings.id, existing.id));
  } else {
    await db.insert(settings).values(updateData);
  }

  return NextResponse.json({ success: true });
}