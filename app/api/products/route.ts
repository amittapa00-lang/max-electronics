import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
  name,
  productCode,
  slug,
  description,
  price,
  quotationOnly,
  stock,
  categoryId,
  images,
} = await req.json();

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          slug,
        },
      });

    if (existingProduct) {
      return NextResponse.json(
        {
          error: "มีสินค้านี้อยู่แล้ว",
        },
        {
          status: 400,
        }
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: Number(categoryId),
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error: "ไม่พบหมวดหมู่",
        },
        {
          status: 400,
        }
      );
    }

   const product =
  await prisma.product.create({
   data: {
  name,
  slug,
  description,

  price: quotationOnly ? 0 : Number(price),

  quotationOnly,

  stock: Number(stock),

      productCode:
        productCode || null,

      categoryId:
        Number(categoryId),

      images: {
        create: (
          images || []
        ).map(
          (url: string) => ({
            imageUrl: url,
          })
        ),
      },
    },

    include: {
      images: true,
      category: true,
    },
  });

    return NextResponse.json(
      product
    );
  } catch (error) {
    console.error(
      "PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}