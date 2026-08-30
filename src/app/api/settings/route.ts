import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";

export async function GET() {
  try {
    const [setting] = await db.select().from(settings).limit(1);

    if (!setting) {
      // Return default settings if none exist
      return NextResponse.json({
        siteName: "Digital Earn Money",
        siteLogo: null,
        favicon: null,
        easypaisaName: "Mohammed Younas",
        easypaisaNumber: "03292993220",
        minDeposit: "150",
        minWithdrawal: "30",
        referralLevels: { level1: 10, level2: 2 },
        whatsappNumber: "03276376052",
        whatsappChannelLink: "https://whatsapp.com/channel/0029VbE1E4jC6Zvj8sD3qU0U",
      });
    }

    return NextResponse.json({
      siteName: setting.siteName,
      siteLogo: setting.siteLogo,
      favicon: setting.favicon,
      easypaisaName: setting.easypaisaName,
      easypaisaNumber: setting.easypaisaNumber,
      minDeposit: setting.minDeposit,
      minWithdrawal: setting.minWithdrawal,
      referralLevels: setting.referralLevels,
      whatsappNumber: setting.whatsappNumber,
      whatsappChannelLink: setting.whatsappChannelLink,
    });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}