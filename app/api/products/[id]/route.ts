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

          productCode:
            productCode || null,

          description,

          price:
            Number(price),

          stock:
            Number(stock),

          categoryId:
            Number(categoryId),

          images: {
            create:
              images?.map(
                (url: string) => ({
                  imageUrl: url,
                })
              ) || [],
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
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await params;

    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "ลบสินค้าไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}