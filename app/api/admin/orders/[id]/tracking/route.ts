import { requireAdmin } from "@/lib/authz";
import { NextResponse } from "next/server";
import { changeOrderStatus, OrderStatusError } from "@/lib/orderStatus";

/** บันทึกขนส่ง + เลขพัสดุ แล้วเปลี่ยนสถานะเป็น "กำลังจัดส่ง" */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const orderId = Number(id);

  let body: { shippingCompany?: unknown; trackingNumber?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const shippingCompany = String(body.shippingCompany ?? "").trim();
  const trackingNumber = String(body.trackingNumber ?? "").trim();

  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
  }
  if (!shippingCompany || !trackingNumber) {
    return NextResponse.json({ error: "กรุณาเลือกขนส่งและกรอกเลขพัสดุ" }, { status: 400 });
  }

  try {
    await changeOrderStatus(orderId, "SHIPPING", { shippingCompany, trackingNumber });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof OrderStatusError) {
      return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    }
    console.error(err);
    return NextResponse.json({ error: "บันทึกเลขพัสดุไม่สำเร็จ" }, { status: 500 });
  }
}
