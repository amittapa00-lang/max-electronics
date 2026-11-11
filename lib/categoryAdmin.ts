import { prisma } from "@/lib/prisma";

export class CategoryError extends Error {
  constructor(message: string, public httpStatus = 400) {
    super(message);
  }
}

function cleanName(raw: unknown) {
  const name = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (!name) throw new CategoryError("กรุณากรอกชื่อหมวดหมู่");
  if (name.length > 100) throw new CategoryError("ชื่อหมวดหมู่ยาวเกิน 100 ตัวอักษร");
  return name;
}

/** ตรวจหมวดแม่: ต้องเป็นหมวดหลัก (ระบบรองรับ 2 ชั้น: หมวดหลัก > หมวดย่อย) */
async function resolveParent(raw: unknown, selfId?: number): Promise<number | null> {
  if (raw === null || raw === undefined || raw === "" || raw === 0) return null;
  const parentId = Number(raw);
  if (!Number.isInteger(parentId)) throw new CategoryError("หมวดหลักไม่ถูกต้อง");
  if (parentId === selfId) throw new CategoryError("เลือกตัวเองเป็นหมวดหลักไม่ได้");
  const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { parentId: true } });
  if (!parent) throw new CategoryError("ไม่พบหมวดหลักที่เลือก", 404);
  if (parent.parentId !== null) throw new CategoryError("เลือกได้เฉพาะหมวดหลักเท่านั้น");
  return parentId;
}

async function assertUniqueName(name: string, parentId: number | null, exceptId?: number) {
  const dup = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, parentId, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { id: true },
  });
  if (dup) throw new CategoryError(`มีหมวด "${name}" อยู่แล้วในระดับเดียวกัน`, 409);
}

export async function createCategory(input: { name: unknown; parentId?: unknown }) {
  const name = cleanName(input.name);
  const parentId = await resolveParent(input.parentId);
  await assertUniqueName(name, parentId);

  // ต่อท้ายลำดับเดิม
  const last = await prisma.category.aggregate({ where: { parentId }, _max: { order: true } });
  return prisma.category.create({
    data: { name, parentId, order: (last._max.order ?? -1) + 1 },
  });
}

export async function updateCategory(id: number, input: { name?: unknown; parentId?: unknown }) {
  const current = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } },
  });
  if (!current) throw new CategoryError("ไม่พบหมวดหมู่", 404);

  const data: { name?: string; parentId?: number | null; order?: number } = {};
  const name = input.name !== undefined ? cleanName(input.name) : current.name;
  let parentId = current.parentId;

  if (input.parentId !== undefined) {
    parentId = await resolveParent(input.parentId, id);
    if (parentId !== null && current._count.children > 0) {
      throw new CategoryError("หมวดที่มีหมวดย่อยอยู่ ย้ายไปเป็นหมวดย่อยไม่ได้");
    }
    if (parentId !== current.parentId) {
      data.parentId = parentId;
      const last = await prisma.category.aggregate({ where: { parentId }, _max: { order: true } });
      data.order = (last._max.order ?? -1) + 1;
    }
  }

  if (name !== current.name || data.parentId !== undefined) {
    await assertUniqueName(name, parentId, id);
  }
  if (name !== current.name) data.name = name;

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: number) {
  const current = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true, products: true } } },
  });
  if (!current) throw new CategoryError("ไม่พบหมวดหมู่", 404);
  if (current._count.children > 0) {
    throw new CategoryError(`ลบไม่ได้ เพราะยังมีหมวดย่อย ${current._count.children} หมวด ย้ายหรือลบหมวดย่อยก่อน`, 409);
  }
  if (current._count.products > 0) {
    throw new CategoryError(`ลบไม่ได้ เพราะยังมีสินค้า ${current._count.products} รายการในหมวดนี้ ย้ายสินค้าไปหมวดอื่นก่อน`, 409);
  }
  await prisma.category.delete({ where: { id } });
}
