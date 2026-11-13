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
      items,
    } = await req.json();

    // มี productId = ขอราคาสินค้าตัวนั้น / ไม่มี = ขอใบเสนอราคาทั่วไป (ลูกค้าพิมพ์รายการเอง)
    const isGeneral = productId === undefined || productId === null || productId === "";
    const itemsText = typeof items === "string" ? items.trim().slice(0, 3000) : "";

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

    if (isGeneral && !itemsText) {
      return NextResponse.json({ error: "กรุณาระบุรายการสินค้าที่ต้องการ" }, { status: 400 });
    }

    const product = isGeneral
      ? null
      : await prisma.product.findUnique({
          where: {
            id: Number(productId),
          },
        });

    if (!isGeneral && !product) {
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
        quantity: isGeneral ? 1 : Math.max(1, Number(quantity) || 1),
        note,
        productId: product ? product.id : null,
        items: itemsText || null,

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
        productName: product?.name ?? null,
        quantity: product ? Number(quantity) : null,
        items: itemsText || null,
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