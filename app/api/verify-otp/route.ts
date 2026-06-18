import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, otp } =
      await req.json();

    const record =
      await prisma.emailOTP.findFirst({
        where: {
          email,
          otp,
        },
      });

    if (!record) {
      return NextResponse.json(
        {
          error: "OTP ไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    if (
      record.expiresAt <
      new Date()
    ) {
      return NextResponse.json(
        {
          error: "OTP หมดอายุ",
        },
        {
          status: 400,
        }
      );
    }

    // ลบ OTP หลังใช้สำเร็จ
    await prisma.emailOTP.deleteMany({
      where: {
        email,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "ยืนยัน OTP สำเร็จ",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาด",
      },
      {
        status: 500,
      }
    );
  }
}