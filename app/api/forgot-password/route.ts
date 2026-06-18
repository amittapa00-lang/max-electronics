import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {

  const { email } =
    await req.json();

  const user =
    await prisma.user.findUnique({
      where:{
        email,
      },
    });

  if(!user){
    return NextResponse.json(
      {
        error:"ไม่พบอีเมลนี้",
      },
      {
        status:400,
      }
    );
  }

  const otp =
    Math.floor(
      100000 +
      Math.random()*900000
    ).toString();

  await prisma.emailOTP.create({
    data:{
      email,
      otp,
      expiresAt:new Date(
        Date.now() +
        5*60*1000
      ),
    },
  });

  await transporter.sendMail({
    from:
      process.env.EMAIL_USER,

    to:email,

    subject:
      "OTP รีเซ็ตรหัสผ่าน",

    html:`
      <h2>OTP ของคุณ</h2>
      <h1>${otp}</h1>
    `,
  });

  return NextResponse.json({
    success:true,
  });
}