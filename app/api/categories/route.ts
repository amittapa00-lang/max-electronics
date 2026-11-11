import { requireAdmin } from "@/lib/authz";
import { NextResponse } from "next/server";
import { CategoryError, createCategory } from "@/lib/categoryAdmin";

export const dynamic = "force-dynamic";

/** (เส้นทางเดิม) เพิ่มหมวดหมู่จากฟอร์ม — ใช้ /api/admin/categories แทนได้ */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    await createCategory({ name: formData.get("name"), parentId: formData.get("parentId") });
    return NextResponse.redirect(new URL("/admin/categories", req.url), 303);
  } catch (err) {
    if (err instanceof CategoryError) return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    console.error(err);
    return NextResponse.json({ error: "เพิ่มหมวดหมู่ไม่สำเร็จ" }, { status: 500 });
  }
}
