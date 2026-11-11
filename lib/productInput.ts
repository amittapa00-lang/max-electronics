import { prisma } from "@/lib/prisma";
import { parseVariants, VariantError, type VariantInput } from "@/lib/variants";

export class ProductInputError extends Error {}

export type ProductInput = {
  name: string;
  productCode: string | null;
  description: string;
  price: number;
  quotationOnly: boolean;
  stock: number;
  categoryId: number;
  images: string[];
  variants: VariantInput[];
};

/** ตรวจข้อมูลสินค้าจากฟอร์ม (ใช้ทั้งเพิ่มและแก้ไข) */
export async function parseProductInput(body: Record<string, unknown>): Promise<ProductInput> {
  const name = String(body.name ?? "").trim();
  if (!name) throw new ProductInputError("กรุณากรอกชื่อสินค้า");

  const quotationOnly = !!body.quotationOnly;
  const price = quotationOnly ? 0 : Math.round(Number(body.price));
  if (!quotationOnly && (!Number.isFinite(price) || price < 0)) throw new ProductInputError("ราคาไม่ถูกต้อง");

  const categoryId = Number(body.categoryId);
  const category = Number.isInteger(categoryId) ? await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }) : null;
  if (!category) throw new ProductInputError("กรุณาเลือกหมวดหมู่");

  let variants: VariantInput[];
  try {
    variants = parseVariants(body.variants);
  } catch (e) {
    throw new ProductInputError(e instanceof VariantError ? e.message : "ข้อมูลตัวเลือกไม่ถูกต้อง");
  }

  // มีตัวเลือก → สต็อกรวมคำนวณจากตัวเลือก
  const stock = variants.length > 0 ? variants.reduce((s, v) => s + v.stock, 0) : Number(body.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0) throw new ProductInputError("จำนวนสต็อกต้องเป็นจำนวนเต็ม 0 ขึ้นไป");

  const images = Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [];

  return {
    name,
    productCode: String(body.productCode ?? "").trim() || null,
    description: String(body.description ?? ""),
    price,
    quotationOnly,
    stock,
    categoryId,
    images,
    variants,
  };
}

/** สร้าง slug ที่ไม่ซ้ำ (รองรับชื่อภาษาไทย) */
export async function uniqueSlug(name: string, productCode: string | null) {
  const base =
    (productCode || name)
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "product";

  let slug = base;
  for (let n = 2; await prisma.product.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}
