import type { Prisma } from "@prisma/client";

export type VariantInput = {
  id?: number;
  name: string;
  sku: string | null;
  price: number | null;
  stock: number;
  imageUrl: string | null;
};

export class VariantError extends Error {}

/** ตรวจและแปลงข้อมูลตัวเลือกที่ส่งมาจากฟอร์ม */
export function parseVariants(raw: unknown): VariantInput[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new VariantError("ข้อมูลตัวเลือกไม่ถูกต้อง");

  const seen = new Set<string>();
  return raw.map((r, i) => {
    const v = (r ?? {}) as Record<string, unknown>;
    const name = String(v.name ?? "").trim();
    if (!name) throw new VariantError(`กรุณากรอกชื่อตัวเลือกที่ ${i + 1}`);
    const key = name.toLowerCase();
    if (seen.has(key)) throw new VariantError(`ชื่อตัวเลือก "${name}" ซ้ำกัน`);
    seen.add(key);

    const stock = Number(v.stock ?? 0);
    if (!Number.isInteger(stock) || stock < 0) throw new VariantError(`สต็อกของ "${name}" ต้องเป็นจำนวนเต็ม 0 ขึ้นไป`);

    const priceRaw = v.price;
    let price: number | null = null;
    if (priceRaw !== null && priceRaw !== undefined && priceRaw !== "") {
      price = Math.round(Number(priceRaw));
      if (!Number.isFinite(price) || price < 0) throw new VariantError(`ราคาของ "${name}" ไม่ถูกต้อง`);
    }

    const id = Number(v.id);
    return {
      id: Number.isInteger(id) && id > 0 ? id : undefined,
      name,
      sku: String(v.sku ?? "").trim() || null,
      price,
      stock,
      imageUrl: String(v.imageUrl ?? "").trim() || null,
    };
  });
}

/**
 * บันทึกตัวเลือกของสินค้า (เพิ่ม / แก้ / ลบที่ไม่อยู่ในรายการ)
 * และตั้งสต็อกรวมของสินค้า = ผลรวมสต็อกทุกตัวเลือก (ถ้ามีตัวเลือก)
 */
export async function saveVariants(tx: Prisma.TransactionClient, productId: number, variants: VariantInput[]) {
  const existing = await tx.productVariant.findMany({ where: { productId }, select: { id: true } });
  const keepIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));

  const toDelete = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);
  if (toDelete.length) await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });

  for (const [order, v] of variants.entries()) {
    const data = { name: v.name, sku: v.sku, price: v.price, stock: v.stock, imageUrl: v.imageUrl, order };
    if (v.id && existing.some((e) => e.id === v.id)) {
      await tx.productVariant.update({ where: { id: v.id }, data });
    } else {
      await tx.productVariant.create({ data: { ...data, productId } });
    }
  }

  if (variants.length > 0) {
    await tx.product.update({
      where: { id: productId },
      data: { stock: variants.reduce((s, v) => s + v.stock, 0) },
    });
  }
}

/** ราคาที่ใช้จริงของสินค้า/ตัวเลือก */
export function effectivePrice(product: { price: number }, variant?: { price: number | null } | null) {
  return variant?.price ?? product.price;
}
