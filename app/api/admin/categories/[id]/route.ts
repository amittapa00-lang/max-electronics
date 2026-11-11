import { requireAdmin } from "@/lib/authz";
import { NextResponse } from "next/server";
import { CategoryError, deleteCategory, updateCategory } from "@/lib/categoryAdmin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function fail(err: unknown, fallback: string) {
  if (err instanceof CategoryError) return NextResponse.json({ error: err.message }, { status: err.httpStatus });
  console.error(err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

/** แก้ไขชื่อ / ย้ายหมวดหลัก — JSON { name?, parentId? } */
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const category = await updateCategory(Number(id), { name: body.name, parentId: body.parentId });
    return NextResponse.json({ success: true, category });
  } catch (err) {
    return fail(err, "บันทึกหมวดหมู่ไม่สำเร็จ");
  }
}

/** ลบหมวดหมู่ (ต้องไม่มีสินค้าและหมวดย่อย) */
export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await deleteCategory(Number(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return fail(err, "ลบหมวดหมู่ไม่สำเร็จ");
  }
}

/** รองรับฟอร์มแบบเดิม: มี name = แก้ชื่อ, ไม่มี = ลบ */
export async function POST(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const name = (await req.formData()).get("name");
    if (name) await updateCategory(Number(id), { name });
    else await deleteCategory(Number(id));
    return NextResponse.redirect(new URL("/admin/categories", req.url), 303);
  } catch (err) {
    return fail(err, "ทำรายการไม่สำเร็จ");
  }
}
