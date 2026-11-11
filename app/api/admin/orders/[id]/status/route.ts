import { requireAdmin } from "@/lib/authz";
import { NextResponse } from "next/server";
import { changeOrderStatus, isOrderStatus, OrderStatusError } from "@/lib/orderStatus";

/**
 * เปลี่ยนสถานะคำสั่งซื้อ (แอดมิน)
 * - รับ JSON { status } → ตอบกลับ JSON (ใช้จากปุ่มในหน้าแอดมิน)
 * - รับ form POST → redirect กลับหน้ารายละเอียด (รองรับฟอร์มแบบเดิม)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const orderId = Number(id);
  const isJson = req.headers.get("content-type")?.includes("application/json");

  let status: unknown;
  try {
    status = isJson ? (await req.json())?.status : (await req.formData()).get("status");
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  if (!Number.isInteger(orderId) || !isOrderStatus(status)) {
    return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const order = await changeOrderStatus(orderId, status);
    if (isJson) return NextResponse.json({ success: true, status: order.status });
    return NextResponse.redirect(new URL(`/admin/orders/${orderId}`, req.url), 303);
  } catch (err) {
    if (err instanceof OrderStatusError) {
      return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    }
    console.error(err);
    return NextResponse.json({ error: "เปลี่ยนสถานะไม่สำเร็จ" }, { status: 500 });
  }
}
