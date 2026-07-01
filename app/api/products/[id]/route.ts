import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const {
  name,
  productCode,
  description,
  price,
  quotationOnly,
  stock,
  categoryId,
  images,
} = await req.json();

    // ลบรูปเก่าทั้งหมดก่อน
    await prisma.productImage.deleteMany({
      where: {
        productId: Number(id),
      },
    });

    const product =
  await prisma.product.update({
    where: {
      id: Number(id),
    },

    data: {
      name,
      productCode,
      description,

      price: quotationOnly
        ? 0
        : Number(price),

      quotationOnly,

      stock: Number(stock),

      categoryId: Number(categoryId),

      images: {
        create:
          images?.map((url: string) => ({
            imageUrl: url,
          })) || [],
      },
    },

    include: {
      category: {
        include: {
          parent: true,
        },
      },

      images: true,
    },
  });
    return NextResponse.json(
      product
    );
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "แก้ไขสินค้าไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    // 1. ลบข้อมูลที่ผูกกับสินค้านี้ออกก่อน (ทำตามลำดับความสัมพันธ์)
    // ลบรูปภาพสินค้า
    await prisma.productImage.deleteMany({ where: { productId } });
    
    // ลบสินค้าในตะกร้าลูกค้า
    await prisma.cartItem.deleteMany({ where: { productId } });
    
    // ลบประวัติการขอใบเสนอราคา
    await prisma.quote.deleteMany({ where: { productId } });

    // หมายเหตุ: สำหรับ orderItems หากมีการสั่งซื้อไปแล้ว 
    // มักจะไม่นิยมลบ เพราะจะกระทบประวัติการขาย (แนะนำให้เช็คก่อน)
    // แต่ถ้าต้องการลบให้ผ่าน ต้องจัดการตรงนี้ด้วยครับ
    await prisma.orderItem.deleteMany({ where: { productId } });

    // 2. เมื่อลบข้อมูลอ้างอิงทั้งหมดแล้ว ค่อยลบตัวสินค้า
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบสินค้าได้ เนื่องจากมีการอ้างอิงข้อมูลนี้ในระบบสั่งซื้อ" },
      { status: 500 }
    );
  }
}