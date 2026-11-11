import { requireAdmin } from "@/lib/authz";
import { NextResponse } from "next/server";
import { CategoryError, createCategory } from "@/lib/categoryAdmin";

export const dynamic = "force-dynamic";

/** เพิ่มหมวดหมู่ — JSON { name, parentId? } */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const isJson = req.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await req.json() : Object.fromEntries(await req.formData());
    const category = await createCategory({ name: body.name, parentId: body.parentId });
    if (!isJson) return NextResponse.redirect(new URL("/admin/categories", req.url), 303);
    return NextResponse.json({ success: true, category });
  } catch (err) {
    if (err instanceof CategoryError) return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    console.error(err);
    return NextResponse.json({ error: "เพิ่มหมวดหมู่ไม่สำเร็จ" }, { status: 500 });
  }
}
