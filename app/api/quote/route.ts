import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

      // ฟิลด์เดิมที่ระบบใช้อยู่แล้ว
      companyName,
      contactName,
      quantity,
      note,
      productId,
    } = await req.json();

    // ตรวจสอบข้อมูลพื้นฐานที่ต้องมีทุกกรณี
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

    // ตรวจสอบข้อมูลเฉพาะนิติบุคคล
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

        // ฟิลด์ใหม่ — ต้องเพิ่มคอลัมน์เหล่านี้ใน model Quote ก่อน (ดูหมายเหตุด้านล่าง)
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

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}

/**
 * หมายเหตุ: ต้องเพิ่มคอลัมน์ต่อไปนี้ใน model Quote ที่ schema.prisma
 * แล้วรัน `npx prisma migrate dev` ก่อน ไม่งั้น field ใหม่จะ error ตอนบันทึก:
 *
 * model Quote {
 *   ...
 *   customerType  String?
 *   firstName     String?
 *   lastName      String?
 *   taxId         String?
 *   businessName  String?
 *   address       String?
 *   province      String?
 *   district      String?
 *   subDistrict   String?
 *   zipCode       String?
 * }
 */