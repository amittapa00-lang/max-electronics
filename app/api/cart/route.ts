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

    const body =
      await req.json();

    const product =
      await prisma.product.findUnique({
        where: {
          id: body.productId,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error:
            "ไม่พบสินค้า",
        },
        {
          status: 404,
        }
      );
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        {
          error:
            "สินค้าหมด",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.cartItem.findFirst({
        where: {
          userId: user.id,
          productId:
            body.productId,
        },
      });

    if (existing) {
      await prisma.cartItem.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    const cartItem =
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId:
            body.productId,
          quantity: 1,
        },
      });

    return NextResponse.json(
      cartItem
    );
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