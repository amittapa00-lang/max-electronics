import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const validStatuses = [
  "PENDING",
  "PROCESSING",
  "EMAILED",
  "COMPLETED",
  "CANCELLED",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "สถานะไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const quote = await prisma.quote.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}