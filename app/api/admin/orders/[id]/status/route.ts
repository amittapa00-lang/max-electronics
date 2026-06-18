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

  const formData =
    await req.formData();

  const status =
    formData.get("status") as string;

  const order =
    await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        items: true,
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

  // ลด Stock ตอนอนุมัติการชำระเงิน
  if (
    status === "PAID" &&
    order.status !== "PAID"
  ) {
    for (const item of order.items) {
      const product =
        await prisma.product.findUnique({
          where: {
            id: item.productId,
          },
        });

      if (
        !product ||
        product.stock <
          item.quantity
      ) {
        return NextResponse.json(
          {
            error: `สินค้า ${product?.name || ""} สต็อกไม่พอ`,
          },
          {
            status: 400,
          }
        );
      }
    }

    for (const item of order.items) {
      await prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement:
              item.quantity,
          },
        },
      });
    }
  }

  await prisma.order.update({
    where: {
      id: Number(id),
    },
    data: {
      status,
    },
  });

  return NextResponse.redirect(
    new URL(
      `/admin/orders/${id}`,
      req.url
    )
  );
}