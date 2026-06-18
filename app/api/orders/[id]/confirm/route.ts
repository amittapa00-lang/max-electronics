import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

  if (!order?.slip) {
    return Response.json(
      {
        error:
          "กรุณาอัปโหลดสลิปก่อนยืนยันคำสั่งซื้อ",
      },
      {
        status: 400,
      }
    );
  }

  const formData =
    await req.formData();

  await prisma.order.update({
    where: {
      id: Number(id),
    },
    data: {
      name: String(
        formData.get("name")
      ),
      phone: String(
        formData.get("phone")
      ),
      address: String(
        formData.get("address")
      ),
      note:
        String(
          formData.get("note")
        ) || null,
    },
  });

  redirect(`/orders/${id}`);
}