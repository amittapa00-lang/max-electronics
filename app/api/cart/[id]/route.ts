import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const cartItem =
      await prisma.cartItem.update({
        where: {
          id: Number(id),
        },
        data: {
          quantity: body.quantity,
        },
      });

    return NextResponse.json(
      cartItem
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "แก้ไขจำนวนสินค้าไม่สำเร็จ",
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

    await prisma.cartItem.delete({
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
        error: "ลบสินค้าไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}