import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/authz";

const MAX_QTY = 999;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const quantity = Number(body?.quantity);

    // จำนวนต้องเป็นจำนวนเต็มบวก (กันยอดสั่งซื้อติดลบ)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return NextResponse.json({ error: "จำนวนสินค้าไม่ถูกต้อง" }, { status: 400 });
    }

    // แก้ได้เฉพาะสินค้าในตะกร้าของตัวเอง
    const result = await prisma.cartItem.updateMany({
      where: { id: Number(id), userId: user.id },
      data: { quantity },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "ไม่พบสินค้าในตะกร้า" }, { status: 404 });
    }

    return NextResponse.json({ success: true, quantity });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "แก้ไขจำนวนสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  try {
    const { id } = await params;

    // ลบได้เฉพาะสินค้าในตะกร้าของตัวเอง
    const result = await prisma.cartItem.deleteMany({
      where: { id: Number(id), userId: user.id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "ไม่พบสินค้าในตะกร้า" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ลบสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}
