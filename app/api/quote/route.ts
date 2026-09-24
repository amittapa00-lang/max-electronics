import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendQuoteNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const {
      customerType,

      firstName,
      lastName,
      phone,
      email,

      taxId,
      businessName,

      address,
      province,
      district,
      subDistrict,
      zipCode,

      companyName,
      contactName,
      quantity,
      note,
      productId,
    } = await req.json();

    if (
      !contactName ||
      !email ||
      !phone ||
      !address ||
      !province ||
      !district ||
      !subDistrict ||
      !zipCode
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    if (customerType === "juristic" && (!taxId || !businessName)) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลนิติบุคคลให้ครบ" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: Number(productId),
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "ไม่พบสินค้า" },
        { status: 404 }
      );
    }

    const quote = await prisma.quote.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        quantity: Number(quantity),
        note,
        productId: Number(productId),

        customerType,
        firstName,
        lastName,
        taxId: customerType === "juristic" ? taxId : null,
        businessName: customerType === "juristic" ? businessName : null,
        address,
        province,
        district,
        subDistrict,
        zipCode,
      },
    });

    // ส่งอีเมลแจ้งเตือนบริษัท
    try {
      await sendQuoteNotification({
        quoteId: quote.id,
        productName: product.name,
        quantity: Number(quantity),
        customerName: contactName,
        email,
        phone,
        companyName,
        note,
      });
    } catch (emailError) {
      // ถ้าส่งเมลไม่ได้ ไม่ให้การบันทึกใบเสนอราคาล้มเหลว
      console.error("ส่งอีเมลแจ้งใบเสนอราคาไม่สำเร็จ:", emailError);
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}