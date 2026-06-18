import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const body =
    await req.json();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

  if (existingUser) {
    return NextResponse.json(
      {
        error:
          "อีเมลนี้ถูกใช้งานแล้ว",
      },
      {
        status: 400,
      }
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      body.password,
      10
    );

  await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password:
        hashedPassword,
      emailVerified: true,
    },
  });

  return NextResponse.json({
    success: true,
    message:
      "สมัครสมาชิกสำเร็จ",
  });
}