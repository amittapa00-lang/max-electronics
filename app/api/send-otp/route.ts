import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const existingUser =
      await prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "อีเมลนี้ถูกใช้งานแล้ว",
        },
        {
          status: 400,
        }
      );
    }

    const otp =
      Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

    await prisma.emailOTP.deleteMany({
      where: {
        email,
      },
    });

    await prisma.emailOTP.create({
      data: {
        email,
        otp,
        expiresAt: new Date(
          Date.now() +
            5 * 60 * 1000
        ),
      },
    });

    await transporter.sendMail({
      from:
        process.env.EMAIL_USER,

      to: email,

      subject: "รหัส OTP",

      html: `
        <h2>MAX Electronics</h2>

        <p>รหัส OTP ของคุณคือ</p>

        <h1>${otp}</h1>

        <p>
          รหัสนี้มีอายุ 5 นาที
        </p>
      `,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error: "ส่ง OTP ไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}