import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "ไม่มีสินค้าในตะกร้า" },
        { status: 400 }
      );
    }

    const productTotal = cartItems.reduce(
      (sum, item) =>
        sum + item.product.price * item.quantity,
      0
    );

    const itemCount = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const shippingFee =
      itemCount <= 2
        ? 100
        : 100 + (itemCount - 2) * 50;

    const total = productTotal + shippingFee;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        name: body.name,
        phone: body.phone,
        address: body.address,
        note: body.note || null,
        slip: body.slip || null,
        total,
        status: "WAITING_VERIFY",
      },
    });

    await prisma.orderItem.createMany({
      data: cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      })),
    });

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // =========================
    // ส่งอีเมลแจ้งเตือน Admin
    // =========================

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const productList = cartItems
        .map(
          (item) =>
            `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;">
                ${item.product.name}
              </td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
                ${item.quantity}
              </td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
                ฿${(
                  item.product.price * item.quantity
                ).toLocaleString()}
              </td>
            </tr>
            `
        )
        .join("");

      await transporter.sendMail({
        from: `"MAX Electronics" <${process.env.EMAIL_USER}>`,

        // ใส่อีเมลที่ต้องการรับแจ้งเตือน
        to: process.env.EMAIL_USER,

        subject: `มีคำสั่งซื้อใหม่ #${order.id}`,

        html: `
          <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;">

            <h2 style="color:#185FA5;">
              มีคำสั่งซื้อใหม่
            </h2>

            <p>
              มีลูกค้าสั่งสินค้าเข้ามาใหม่
            </p>

            <hr />

            <h3>ข้อมูลลูกค้า</h3>

            <p>
              <b>ชื่อ:</b> ${body.name}
            </p>

            <p>
              <b>อีเมล:</b> ${session.user.email}
            </p>

            <p>
              <b>โทร:</b> ${body.phone}
            </p>

            <p>
              <b>ที่อยู่:</b> ${body.address}
            </p>

            ${
              body.note
                ? `<p><b>หมายเหตุ:</b> ${body.note}</p>`
                : ""
            }

            <hr />

            <h3>รายการสินค้า</h3>

            <table
              style="
                width:100%;
                border-collapse:collapse;
              "
            >
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">
                    สินค้า
                  </th>
                  <th style="padding:8px;">
                    จำนวน
                  </th>
                  <th style="text-align:right;padding:8px;">
                    ราคา
                  </th>
                </tr>
              </thead>

              <tbody>
                ${productList}
              </tbody>
            </table>

            <hr />

            <p>
              <b>ค่าสินค้า:</b>
              ฿${productTotal.toLocaleString()}
            </p>

            <p>
              <b>ค่าจัดส่ง:</b>
              ฿${shippingFee.toLocaleString()}
            </p>

            <h2 style="color:#185FA5;">
              ยอดรวม ฿${total.toLocaleString()}
            </h2>

            <p>
              <b>สถานะ:</b> รอตรวจสอบ
            </p>

            <p>
              <b>เลขคำสั่งซื้อ:</b> #${order.id}
            </p>

          </div>
        `,
      });

      console.log(
        `ส่งอีเมลแจ้งเตือน Order #${order.id} สำเร็จ`
      );
    } catch (emailError) {
      // ถ้าส่งอีเมลไม่ได้ จะไม่ทำให้การสั่งซื้อล้มเหลว
      console.error(
        "ส่งอีเมลแจ้งเตือน Order ไม่สำเร็จ:",
        emailError
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "สร้างคำสั่งซื้อไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}