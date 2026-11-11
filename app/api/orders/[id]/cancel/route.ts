import { canAccessOrder, getAuthUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { changeOrderStatus } from "@/lib/orderStatus";

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

  if (order && !canAccessOrder(await getAuthUser(), order)) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
  }

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

  // คืนสต็อกให้อัตโนมัติ หากคำสั่งซื้อนี้ถูกตัดสต็อกไปแล้ว
  await changeOrderStatus(order.id, "CANCELLED");

  // 303 = ให้เบราว์เซอร์เปิดหน้าคำสั่งซื้อด้วย GET (ไม่ส่ง POST ซ้ำ)
  return NextResponse.redirect(new URL(`/orders/${id}`, req.url), 303);
}