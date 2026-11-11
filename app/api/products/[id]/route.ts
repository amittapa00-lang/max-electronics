import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { parseProductInput, ProductInputError } from "@/lib/productInput";
import { saveVariants } from "@/lib/variants";

/** แก้ไขสินค้า (รูปและตัวเลือกจะถูกแทนที่ด้วยรายการที่ส่งมา) */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const productId = Number(id);
    const input = await parseProductInput(await req.json());

    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId } });
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          name: input.name,
          productCode: input.productCode,
          description: input.description,
          price: input.price,
          quotationOnly: input.quotationOnly,
          stock: input.stock,
          categoryId: input.categoryId,
          images: { create: input.images.map((imageUrl) => ({ imageUrl })) },
        },
      });
      await saveVariants(tx, productId, input.variants);
      return updated;
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("UPDATE PRODUCT ERROR:", error);
    return NextResponse.json({ error: "แก้ไขสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const productId = Number(id);

    // สินค้าที่เคยถูกสั่งซื้อหรือขอใบเสนอราคา ห้ามลบ เพื่อไม่ให้ประวัติคำสั่งซื้อ/ยอดเงินเสียหาย
    const [orderCount, quoteCount] = await Promise.all([
      prisma.orderItem.count({ where: { productId } }),
      prisma.quote.count({ where: { productId } }),
    ]);
    if (orderCount > 0 || quoteCount > 0) {
      const used = [orderCount > 0 && `คำสั่งซื้อ ${orderCount} รายการ`, quoteCount > 0 && `ใบเสนอราคา ${quoteCount} รายการ`]
        .filter(Boolean)
        .join(" และ ");
      return NextResponse.json(
        { error: `ลบไม่ได้ เพราะสินค้านี้อยู่ใน${used} หากเลิกขายแล้ว ให้แก้สต็อกเป็น 0 แทน` },
        { status: 409 }
      );
    }

    // ลบรูปภาพและสินค้าในตะกร้าของลูกค้าก่อน
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.cartItem.deleteMany({ where: { productId } });

    // ลบตัวสินค้า
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "ลบสินค้าไม่สำเร็จ" },
      { status: 500 }
    );
  }
}