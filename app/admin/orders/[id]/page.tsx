import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageOff, Phone, Printer } from "lucide-react";
import { orderShippingFee } from "@/lib/shipping";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderWorkflow from "@/components/admin/OrderWorkflow";
import CopyButton from "@/components/CopyButton";
import { AdminPage, Card, PageHeader, btn } from "@/components/admin/ui";

const STEPS = [
  { key: "WAITING_VERIFY", label: "ตรวจสลิป" },
  { key: "PAID", label: "ชำระแล้ว" },
  { key: "PREPARING", label: "แพ็กสินค้า" },
  { key: "SHIPPING", label: "จัดส่ง" },
  { key: "COMPLETED", label: "สำเร็จ" },
];

const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { include: { images: true } }, variant: { select: { stock: true } } } },
    },
  });
  if (!order) notFound();

  const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = orderShippingFee(order.total, itemsTotal, totalQty);
  const grandTotal = itemsTotal + shippingFee;

  const isCancelled = order.status === "CANCELLED";
  const stepIndex = order.status === "PENDING" ? 0 : STEPS.findIndex((s) => s.key === order.status);
  const shippingLabel = `${order.name}\n${order.phone}\n${order.address}`;

  return (
    <AdminPage>
      <PageHeader
        back={{ href: "/admin/orders", label: "คำสั่งซื้อทั้งหมด" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            คำสั่งซื้อ #{order.id} <OrderStatusBadge status={order.status} large />
          </span>
        }
        description={`สั่งเมื่อ ${dateFmt.format(order.createdAt)} · ${totalQty} ชิ้น · ยอดรวม ฿${grandTotal.toLocaleString()}`}
        actions={
          <Link href={`/admin/orders/labels?ids=${order.id}`} target="_blank" className={btn.secondary}>
            <Printer className="h-4 w-4" /> พิมพ์ใบปะหน้า
          </Link>
        }
      />

      {/* แถบขั้นตอน */}
      {!isCancelled && (
        <ol className="mb-6 grid grid-cols-5 gap-1 rounded-xl border border-slate-200 bg-white p-2 text-center">
          {STEPS.map((s, i) => {
            const done = i < stepIndex || order.status === "COMPLETED";
            const current = i === stepIndex && order.status !== "COMPLETED";
            return (
              <li
                key={s.key}
                className={`rounded-lg px-1 py-2 text-xs font-semibold sm:text-sm ${
                  current ? "bg-brand-600 text-white" : done ? "bg-brand-50 text-brand-700" : "text-slate-400"
                }`}
              >
                {done && !current ? "✓ " : `${i + 1}. `}
                {s.label}
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ขั้นตอนถัดไป — มือถือแสดงก่อน */}
        <div className="space-y-6 lg:order-2">
          <Card title="ขั้นตอนถัดไป" className="lg:sticky lg:top-6">
            <OrderWorkflow
              orderId={order.id}
              status={order.status}
              grandTotal={grandTotal}
              hasSlip={!!order.slip}
              shippingCompany={order.shippingCompany}
              trackingNumber={order.trackingNumber}
            />
          </Card>

          <Card title="ผู้รับสินค้า" action={<CopyButton text={shippingLabel} label="คัดลอกที่อยู่" />}>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">ชื่อผู้รับ</dt>
                <dd className="font-semibold text-slate-900">{order.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">เบอร์โทร</dt>
                <dd>
                  <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {order.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">ที่อยู่จัดส่ง</dt>
                <dd className="whitespace-pre-line leading-relaxed text-slate-800">{order.address}</dd>
              </div>
              {order.note && (
                <div className="rounded-lg bg-amber-50 px-3 py-2">
                  <dt className="text-xs font-semibold text-amber-800">หมายเหตุจากลูกค้า</dt>
                  <dd className="text-amber-900">{order.note}</dd>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3">
                <dt className="text-slate-500">บัญชีผู้สั่ง</dt>
                <dd className="text-slate-800">
                  {order.user.name} <span className="text-slate-400">· {order.user.email}</span>
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="space-y-6 lg:order-1 lg:col-span-2">
          {/* สลิป */}
          <Card title="สลิปการโอนเงิน">
            {order.slip ? (
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href={order.slip}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-3/4 w-full max-w-60 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  <Image src={order.slip} alt="สลิปการโอนเงิน" fill sizes="240px" className="object-contain" />
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-slate-700 shadow">
                    <ExternalLink className="h-3.5 w-3.5" /> ดูรูปเต็ม
                  </span>
                </a>
                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">ยอดที่ต้องได้รับ (เทียบกับสลิป)</p>
                    <p className="text-3xl font-bold text-slate-900">฿{grandTotal.toLocaleString()}</p>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• ยอดเงินตรงกับยอดด้านบน</li>
                    <li>• โอนเข้าบัญชีร้าน (กสิกรไทย 241-8-87380-1)</li>
                    <li>• วันเวลาในสลิปไม่เก่ากว่าวันที่สั่ง</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <ImageOff className="h-4 w-4" /> ลูกค้ายังไม่ได้แนบสลิป
              </p>
            )}
          </Card>

          {/* รายการสินค้า */}
          <Card title={`รายการสินค้า (${totalQty} ชิ้น)`} padded={false}>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const img = item.product.images?.[0]?.imageUrl;
                return (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {img ? (
                        <Image src={img} alt={item.product.name} fill sizes="56px" className="object-contain p-1" />
                      ) : (
                        <ImageOff className="m-auto mt-4 h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.product.name}</p>
                      {item.variantName && (
                        <p className="mt-0.5 inline-block rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">ตัวเลือก: {item.variantName}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        {item.product.productCode && <span className="font-mono">{item.product.productCode} · </span>}
                        {item.quantity} × ฿{item.price.toLocaleString()} · คงเหลือในสต็อก {item.variant ? item.variant.stock : item.product.stock}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-slate-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                  </li>
                );
              })}
            </ul>
            <dl className="space-y-1.5 border-t border-slate-100 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">ค่าสินค้า</dt>
                <dd className="text-slate-900">฿{itemsTotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">ค่าจัดส่ง</dt>
                <dd className="text-slate-900">฿{shippingFee.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base">
                <dt className="font-semibold text-slate-900">รวมทั้งหมด</dt>
                <dd className="font-bold text-brand-700">฿{grandTotal.toLocaleString()}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}
