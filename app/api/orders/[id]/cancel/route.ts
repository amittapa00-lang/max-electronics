import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  const order =
    await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
    });

  if (!order) {
    return NextResponse.json(
      {
        error: "ไม่พบออเดอร์",
      },
      {
        status: 404,
      }
    );
  }

  if (
    ["SHIPPING", "COMPLETED"].includes(
      order.status
    )
  ) {
    return NextResponse.json(
      {
        error:
          "ไม่สามารถยกเลิกได้",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.order.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "CANCELLED",
    },
  });

  return NextResponse.redirect(
    new URL(
      `/orders/${id}`,
      req.url
    )
  );
}