import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as {
      items: { id: number; order: number }[];
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "ไม่มีข้อมูลลำดับ" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder categories failed:", error);
    return NextResponse.json(
      { error: "อัปเดตลำดับไม่สำเร็จ" },
      { status: 500 }
    );
  }
}