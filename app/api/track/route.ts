// app/api/track/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();

    // ทำ hash ip+useragent เพื่อไม่เก็บ ip ตรงๆ (privacy) แต่ยังใช้แยกผู้ชมซ้ำในวันเดียวกันได้คร่าวๆ
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ua = req.headers.get("user-agent") ?? "unknown";
    const today = new Date().toISOString().slice(0, 10);
    const visitorHash = crypto
      .createHash("sha256")
      .update(`${ip}-${ua}-${today}`)
      .digest("hex");

    await prisma.pageView.create({
      data: {
        path: typeof path === "string" ? path.slice(0, 255) : "/",
        visitorHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // ไม่ควรทำให้หน้าเว็บ error เพราะการนับสถิติล้มเหลว
    console.error("track error:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}