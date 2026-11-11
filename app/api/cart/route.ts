import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error:
            "กรุณาเข้าสู่ระบบ",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email:
            session.user.email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "ไม่พบผู้ใช้",
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();
    const productId = Number(body.productId);
    const variantId = body.variantId ? Number(body.variantId) : null;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: { select: { id: true, name: true, stock: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
    }
    if (product.quotationOnly) {
      return NextResponse.json({ error: "สินค้านี้ต้องขอใบเสนอราคา" }, { status: 400 });
    }

    // สินค้าที่มีตัวเลือก ต้องเลือกตัวเลือกก่อน
    const hasVariants = product.variants.length > 0;
    let available = product.stock;
    if (hasVariants) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ error: "กรุณาเลือกตัวเลือกสินค้า" }, { status: 400 });
      }
      available = variant.stock;
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: user.id, productId, variantId: hasVariants ? variantId : null },
    });

    if ((existing?.quantity ?? 0) + 1 > available) {
      return NextResponse.json(
        { error: available <= 0 ? "สินค้าหมด" : `มีสินค้าเหลือ ${available} ชิ้น (อยู่ในตะกร้าแล้ว ${existing?.quantity ?? 0} ชิ้น)` },
        { status: 400 }
      );
    }

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: { increment: 1 } } });
      return NextResponse.json({ success: true });
    }

    const cartItem = await prisma.cartItem.create({
      data: { userId: user.id, productId, variantId: hasVariants ? variantId : null, quantity: 1 },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "เพิ่มลงตะกร้าไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}
// จำนวนสินค้าในตะกร้า (ใช้แสดงตัวเลขบนไอคอนตะกร้าที่ Navbar)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ count: 0 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ count: 0 });
  }

  const result = await prisma.cartItem.aggregate({
    where: { userId: user.id },
    _sum: { quantity: true },
  });

  return NextResponse.json({ count: result._sum.quantity ?? 0 });
}
