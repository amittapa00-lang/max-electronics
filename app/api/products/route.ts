import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { parseProductInput, ProductInputError, uniqueSlug } from "@/lib/productInput";
import { saveVariants } from "@/lib/variants";

/** เพิ่มสินค้าใหม่ (พร้อมรูปและตัวเลือก) */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = await parseProductInput(await req.json());
    const slug = await uniqueSlug(input.name, input.productCode);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          price: input.price,
          quotationOnly: input.quotationOnly,
          stock: input.stock,
          productCode: input.productCode,
          categoryId: input.categoryId,
          images: { create: input.images.map((imageUrl) => ({ imageUrl })) },
        },
      });
      await saveVariants(tx, created.id, input.variants);
      return created;
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("PRODUCT ERROR:", error);
    return NextResponse.json({ error: "เพิ่มสินค้าไม่สำเร็จ" }, { status: 500 });
  }
}
