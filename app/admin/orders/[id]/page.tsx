import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AdminShippingForm from "@/components/AdminShippingForm";

function calcShippingFee(totalQty: number): number {
  if (totalQty <= 2) return 100;
  return 100 + (totalQty - 2) * 50;
}

const STATUS_FLOW = [
  "PENDING",
  "WAITING_VERIFY",
  "PAID",
  "PREPARING",
  "SHIPPING",
  "COMPLETED",
] as const;

const statusMap = {
  PENDING:        { label: "รอชำระเงิน",      short: "รอชำระ",    icon: "🕐", color: "bg-amber-100 text-amber-700 ring-amber-200" },
  WAITING_VERIFY: { label: "รอตรวจสอบสลิป",   short: "รอตรวจสลิป", icon: "🔍", color: "bg-orange-100 text-orange-700 ring-orange-200" },
  PAID:           { label: "ชำระเงินแล้ว",     short: "ชำระแล้ว",  icon: "💰", color: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  PREPARING:      { label: "เตรียมสินค้า",     short: "เตรียมของ", icon: "📦", color: "bg-indigo-100 text-indigo-700 ring-indigo-200" },
  SHIPPING:       { label: "กำลังจัดส่ง",      short: "จัดส่ง",    icon: "🚚", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  COMPLETED:      { label: "จัดส่งสำเร็จ",     short: "สำเร็จ",    icon: "✅", color: "bg-purple-100 text-purple-700 ring-purple-200" },
  CANCELLED:      { label: "ยกเลิกคำสั่งซื้อ", short: "ยกเลิก",    icon: "✕", color: "bg-red-100 text-red-700 ring-red-200" },
} as const;

// The next actionable status the admin most likely wants — kept as a single
// primary call to action instead of three competing buttons.
const NEXT_STATUS: Partial<Record<string, { status: string; label: string; color: string }>> = {
  PENDING: { status: "PAID", label: "ยืนยันการชำระเงิน", color: "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100" },
  WAITING_VERIFY: { status: "PAID", label: "ยืนยันการชำระเงิน", color: "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100" },
  PAID: { status: "PREPARING", label: "เริ่มเตรียมสินค้า", color: "bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100" },
  PREPARING: { status: "SHIPPING", label: "จัดส่งสินค้าแล้ว", color: "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100" },
  SHIPPING: { status: "COMPLETED", label: "ยืนยันจัดส่งสำเร็จ", color: "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100" },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: {
        include: {
          product: { include: { images: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const status = statusMap[order.status as keyof typeof statusMap];
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = calcShippingFee(totalQty);
  const grandTotal = total + shippingFee;

  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
  const nextAction = NEXT_STATUS[order.status];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-800"
          >
            ← กลับไปหน้ารายการคำสั่งซื้อ
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                คำสั่งซื้อ #{order.id}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
                {" · "}
                {order.name} · {order.phone}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ${status?.color}`}>
              <span>{status?.icon}</span>
              {status?.label}
            </span>
          </div>
        </div>

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold text-red-700">คำสั่งซื้อถูกยกเลิกแล้ว</p>
              <p className="text-sm text-red-500">ลูกค้าเป็นผู้ยกเลิกคำสั่งซื้อเอง</p>
            </div>
          </div>
        )}

        {/* Status progress — a real sequence, so a stepper communicates
            "where is this order right now" faster than a badge alone. */}
        {!isCancelled && (
          <div className="mb-6 overflow-x-auto rounded-2xl border bg-white p-5 shadow-sm">
            <ol className="flex min-w-140 items-center">
              {STATUS_FLOW.map((s, i) => {
                const meta = statusMap[s];
                const done = i < currentStepIndex;
                const current = i === currentStepIndex;
                return (
                  <li key={s} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-2 transition
                          ${done ? "bg-gray-900 text-white ring-gray-900" : ""}
                          ${current ? "bg-white text-gray-900 ring-gray-900" : ""}
                          ${!done && !current ? "bg-gray-100 text-gray-400 ring-gray-200" : ""}`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={`whitespace-nowrap text-xs font-medium ${current ? "text-gray-900" : "text-gray-400"}`}>
                        {meta.short}
                      </span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`mx-2 h-0.5 flex-1 rounded ${done ? "bg-gray-900" : "bg-gray-200"}`} />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ===== Main column ===== */}
          <div className="space-y-6 lg:col-span-2">

            {/* รายการสินค้า */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                📦 รายการสินค้า
                <span className="text-sm font-normal text-gray-400">({totalQty} ชิ้น)</span>
              </h2>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:bg-gray-50 sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <Image
                        src={item.product.images?.[0]?.imageUrl || "/uploads/no-image.jpg"}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-xl border object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-gray-900">{item.product.name}</h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {item.quantity} ชิ้น × ฿{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-gray-900">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* สรุปยอด */}
              <div className="mt-5 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ราคาสินค้า</span>
                  <span className="font-medium text-gray-800">฿{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    ค่าจัดส่ง ({totalQty <= 2 ? "1–2 ชิ้นแรก" : `2 ชิ้นแรก + ${totalQty - 2} ชิ้น × ฿50`})
                  </span>
                  <span className="font-medium text-orange-600">฿{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-base font-bold text-gray-900">รวมทั้งหมด</span>
                  <span className="text-xl font-bold text-gray-900">฿{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* สลิป */}
            {order.slip && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">💳 สลิปการโอนเงิน</h2>

                <a
                  href={order.slip}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square w-full max-w-45 cursor-zoom-in overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <Image
                    src={order.slip}
                    alt="สลิปการโอนเงิน"
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow">
                      🔍 ดูรูปเต็ม
                    </span>
                  </div>
                </a>
                <p className="mt-2 text-xs text-gray-400">คลิกที่รูปเพื่อเปิดดูขนาดเต็มในแท็บใหม่</p>
              </div>
            )}

            {/* ข้อมูลการจัดส่ง */}
            {!isCancelled && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">🚚 ข้อมูลการจัดส่ง</h2>

                {order.trackingNumber && (
                  <div className="mb-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">
                    <div>
                      <p className="text-xs font-medium text-green-600">{order.shippingCompany || "ไม่ระบุขนส่ง"}</p>
                      <p className="text-base font-bold text-gray-900">{order.trackingNumber}</p>
                    </div>
                    <span className="text-2xl">📦</span>
                  </div>
                )}

                <AdminShippingForm orderId={order.id} />
              </div>
            )}
          </div>

          {/* ===== Sidebar ===== */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">

            {/* จัดการสถานะ — one clear primary action instead of three
                permanently-visible buttons that compete for attention */}
            {!isCancelled && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold text-gray-900">ขั้นตอนถัดไป</h2>

                {nextAction ? (
                  <form action={`/api/admin/orders/${order.id}/status`} method="POST">
                    <input type="hidden" name="status" value={nextAction.status} />
                    <button
                      className={`w-full rounded-xl border-2 py-3 font-bold shadow-sm transition ${nextAction.color}`}
                    >
                      {nextAction.label}
                    </button>
                  </form>
                ) : (
                  <p className="rounded-xl bg-gray-50 py-3 text-center text-sm text-gray-400">
                    คำสั่งซื้อเสร็จสมบูรณ์แล้ว
                  </p>
                )}

                {order.status !== "COMPLETED" && (
                  <details className="mt-4 group">
                    <summary className="cursor-pointer text-xs font-medium text-gray-400 transition hover:text-gray-600">
                      ตัวเลือกอื่น ๆ
                    </summary>
                    <div className="mt-3 space-y-2">
                      {STATUS_FLOW.filter((s) => s !== order.status).map((s) => (
                        <form key={s} action={`/api/admin/orders/${order.id}/status`} method="POST">
                          <input type="hidden" name="status" value={s} />
                          <button className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100">
                            {statusMap[s].icon} เปลี่ยนเป็น {statusMap[s].label}
                          </button>
                        </form>
                      ))}
                      <form action={`/api/admin/orders/${order.id}/status`} method="POST">
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100">
                          ✕ ยกเลิกคำสั่งซื้อ
                        </button>
                      </form>
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* ข้อมูลผู้รับ */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">👤 ข้อมูลผู้รับ</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-400">ชื่อผู้รับ</dt>
                  <dd className="font-medium text-gray-800">{order.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">เบอร์โทร</dt>
                  <dd className="font-medium text-gray-800">
                    <a href={`tel:${order.phone}`} className="hover:text-blue-600 hover:underline">
                      {order.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">ที่อยู่จัดส่ง</dt>
                  <dd className="font-medium leading-relaxed text-gray-800">{order.address}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}