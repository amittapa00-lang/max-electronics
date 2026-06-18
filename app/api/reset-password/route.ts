import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {

  const {
    email,
    otp,
    password,
  } = await req.json();

  const record =
    await prisma.emailOTP.findFirst({
      where:{
        email,
        otp,
      },
    });

  if(!record){

    return NextResponse.json(
      {
        error:"OTP ไม่ถูกต้อง",
      },
      {
        status:400,
      }
    );

  }

  if(
    record.expiresAt <
    new Date()
  ){

    return NextResponse.json(
      {
        error:"OTP หมดอายุ",
      },
      {
        status:400,
      }
    );

  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  await prisma.user.update({
    where:{
      email,
    },
    data:{
      password:
        hashedPassword,
    },
  });

  await prisma.emailOTP.deleteMany({
    where:{
      email,
    },
  });

  return NextResponse.json({
    success:true,
  });
}