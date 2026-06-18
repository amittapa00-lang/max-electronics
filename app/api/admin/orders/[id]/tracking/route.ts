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
  const { id } =
    await params;

  const body =
    await req.json();

  await prisma.order.update({
    where: {
      id: Number(id),
    },
    data: {
      shippingCompany:
        body.shippingCompany,

      trackingNumber:
        body.trackingNumber,

      status: "SHIPPING",
    },
  });

  return NextResponse.json({
    success: true,
  });
}