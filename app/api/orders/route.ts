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
            "ไม่พบผู้ใช้งาน",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await req.json();

    const cartItems =
      await prisma.cartItem.findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: true,
        },
      });

    if (
      cartItems.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "ไม่มีสินค้าในตะกร้า",
        },
        {
          status: 400,
        }
      );
    }

    const productTotal =
  cartItems.reduce(
    (sum, item) =>
      sum +
      item.product.price *
        item.quantity,
    0
  );

const itemCount =
  cartItems.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

const shippingFee =
  itemCount <= 2
    ? 100
    : 100 + (itemCount - 2) * 50;

const total =
  productTotal + shippingFee;

    const order =
      await prisma.order.create({
        data: {
          userId: user.id,
          name: body.name,
          phone: body.phone,
          address:
            body.address,
          note:
            body.note || null,
          slip:
            body.slip || null,
          total,
          status:
            "WAITING_VERIFY",
        },
      });

    await prisma.orderItem.createMany(
      {
        data: cartItems.map(
          (item) => ({
            orderId:
              order.id,
            productId:
              item.productId,
            quantity:
              item.quantity,
            price:
              item.product.price,
          })
        ),
      }
    );

    await prisma.cartItem.deleteMany(
      {
        where: {
          userId: user.id,
        },
      }
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "สร้างคำสั่งซื้อไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}