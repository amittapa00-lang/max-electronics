import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  ImageOff,
  MapPin,
  MessageCircle,
  Package,
  Receipt,
  ShieldCheck,
  Truck,
} from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { SHOP_LINE_URL } from "@/components/SocialIcons";
import { orderShippingFee } from "@/lib/shipping";

const ORDER_STEPS = [
  { label: "รอชำระเงิน", key: "PENDING" },
  { label: "ตรวจสลิป", key: "WAITING_VERIFY" },
  { label: "ชำระแล้ว", key: "PAID" },
  { label: "เตรียมสินค้า", key: "PREPARING" },
  { label: "จัดส่ง", key: "SHIPPING" },
  { label: "สำเร็จ", key: "COMPLETED" },
];

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    PENDING: 0, WAITING_VERIFY: 1, PAID: 2,
    PREPARING: 3, SHIPPING: 4, COMPLETED: 5, CANCELLED: -1,
  };
  return map[status] ?? 0;
}


const STATUS_HINT: Record<string, string> = {
  PENDING: "กรุณาชำระเงินและแนบสลิปเพื่อยืนยันคำสั่งซื้อ",
  WAITING_VERIFY: "ได้รับคำสั่งซื้อแล้ว ทีมงานกำลังตรวจสอบสลิปการโอนเงิน",
  PAID: "ชำระเงินเรียบร้อย กำลังเตรียมจัดส่ง",
  PREPARING: "กำลังแพ็กสินค้า จะแจ้งเลขพัสดุเมื่อจัดส่งแล้ว",
  SHIPPING: "สินค้าอยู่ระหว่างการจัดส่ง ตรวจสอบเลขพัสดุด้านล่าง",
  COMPLETED: "จัดส่งสำเร็จ ขอบคุณที่ใช้บริการ MaxTech Electric",
  CANCELLED: "คำสั่งซื้อนี้ถูกยกเลิกแล้ว",
};

const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" });

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: {
        include: { product: { include: { images: true } } },
      },
    },
  });
  if (!order) notFound();

  const currentStep = getStepIndex(order.status);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  // คำนวณจากรายการจริง เพื่อให้สรุปยอดตรงกับรายการสินค้าด้านบนเสมอ
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = orderShippingFee(order.total, itemsTotal, totalQty);
  const cancellable = order.status !== "COMPLETED" && order.status !== "CANCELLED";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500" aria-label="breadcrumb">
        <Link href="/orders" className="hover:text-brand-600">คำสั่งซื้อของฉัน</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-800">#{order.id}</span>
      </nav>

      {/* Header */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">คำสั่งซื้อ #{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">สั่งเมื่อ {dateFmt.format(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} large />
      </div>

      {/* ความคืบหน้า */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-700">{STATUS_HINT[order.status] ?? ""}</p>

        {order.status !== "CANCELLED" && (
          <ol className="mt-5 grid grid-cols-6 gap-1">
            {ORDER_STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <li key={step.key} className="flex flex-col items-center gap-2 text-center">
                  <div className="relative flex w-full items-center justify-center">
                    {i > 0 && (
                      <span className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${i <= currentStep ? "bg-brand-600" : "bg-slate-200"}`} />
                    )}
                    <span
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                        active ? "bg-brand-600 text-white" : done ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                  </div>
                  <span className={`text-[11px] sm:text-xs leading-tight ${active ? "font-semibold text-slate-900" : done ? "text-slate-700" : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {order.trackingNumber && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <Truck className="h-5 w-5 shrink-0 text-brand-600" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{order.shippingCompany || "ขนส่ง"} · เลขพัสดุ</p>
              <p className="font-mono text-lg font-bold tracking-wider text-slate-900 break-all">{order.trackingNumber}</p>
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ซ้าย */}
        <div className="lg:col-span-2 space-y-6">
          <Card icon={Package} title={`รายการสินค้า (${order.items.length})`}>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const img = item.product.images?.[0]?.imageUrl;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={item.product.name} className="h-full w-full object-contain p-0.5" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-400">฿{item.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card icon={MapPin} title="ข้อมูลจัดส่ง">
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">ชื่อผู้รับ</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{order.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">เบอร์โทรศัพท์</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{order.phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">ที่อยู่จัดส่ง</dt>
                <dd className="mt-0.5 whitespace-pre-line font-medium leading-relaxed text-slate-900">{order.address.trim()}</dd>
              </div>
              {order.note && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">หมายเหตุ</dt>
                  <dd className="mt-1 rounded-md bg-amber-50 px-3 py-2 text-amber-900">{order.note}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        {/* ขวา */}
        <div className="space-y-6">
          <Card icon={Receipt} title="สรุปยอด">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">ราคาสินค้า</dt>
                <dd className="text-slate-900">฿{itemsTotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">ค่าจัดส่ง ({totalQty} ชิ้น)</dt>
                <dd className="text-slate-900">฿{shippingFee.toLocaleString()}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-end justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">ยอดรวม</span>
              <span className="text-2xl font-bold text-brand-600">฿{(itemsTotal + shippingFee).toLocaleString()}</span>
            </div>
          </Card>

          {order.slip && (
            <Card icon={ClipboardList} title="สลิปโอนเงิน">
              <a href={order.slip} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.slip} alt="สลิปโอนเงิน" className="mx-auto block max-h-64 w-auto object-contain" />
              </a>
            </Card>
          )}

          <Card icon={MessageCircle} title="ต้องการความช่วยเหลือ?">
            <div className="space-y-2">
              {["จัดส่งแล้ว แต่ยังไม่ได้รับสินค้า", "ต้องการแก้ไขที่อยู่จัดส่ง", "ชำระแล้ว แต่สถานะไม่เปลี่ยน"].map((label) => (
                <a
                  key={label}
                  href={SHOP_LINE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:border-brand-300 hover:text-brand-700"
                >
                  {label}
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </a>
              ))}
            </div>
          </Card>

          {cancellable && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> ยกเลิกคำสั่งซื้อ
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
                <li>ไม่คืนเงินทุกกรณี</li>
                <li>หากจัดส่งแล้ว ไม่สามารถยกเลิกได้</li>
              </ul>
              <form action={`/api/orders/${order.id}/cancel`} method="POST" className="mt-3">
                <button
                  type="submit"
                  className="h-10 w-full rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  ยกเลิกคำสั่งซื้อ
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <PolicySection />
    </main>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-900">
        <Icon className="h-4.5 w-4.5 text-brand-600" /> {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PolicySection() {
  return (
    <details className="group mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-brand-600" /> นโยบายการเปลี่ยน/คืนสินค้า และการรับประกัน
        </span>
        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
      </summary>

      <div className="grid gap-4 border-t border-slate-100 p-5 text-sm md:grid-cols-3">
        <PolicyBlock title="ข้อตกลงการสั่งซื้อและการยกเลิก">
          <li>คำสั่งซื้อที่ชำระเงินและยืนยันรายการแล้ว ไม่สามารถยกเลิกได้</li>
          <li>กรณีร้านค้าจัดส่งสินค้าแล้ว จะไม่สามารถยกเลิกคำสั่งซื้อได้</li>
          <li>ร้านไม่รับผิดชอบความเสียหายจากการใช้งานผิดวิธี การติดตั้งไม่ถูกต้อง หรือเหตุสุดวิสัยหลังได้รับสินค้า</li>
        </PolicyBlock>
        <PolicyBlock title="การเปลี่ยนสินค้า">
          <li>สินค้าเสียจากการผลิต แจ้งเปลี่ยนได้ภายใน 30 วันหลังได้รับสินค้า</li>
          <li>สินค้าต้องอยู่ในสภาพเดิม บรรจุภัณฑ์และสติกเกอร์รับประกันครบถ้วน</li>
          <li>หากไม่มีรุ่นเดิม ขอสงวนสิทธิ์คืนเงินหรือเปลี่ยนรุ่นมูลค่าเทียบเท่า</li>
          <li>ลูกค้ารับผิดชอบค่าส่งสินค้ากลับ · คืนเงินเฉพาะค่าสินค้า</li>
          <li>ดำเนินการภายใน 7 วันทำการหลังตรวจสอบสินค้า</li>
        </PolicyBlock>
        <PolicyBlock title="การรับประกัน (ใหม่ 3 เดือน · มือสอง 1 เดือน)">
          <li>ครอบคลุมความเสียหายจากตัวสินค้าภายใต้การใช้งานปกติ</li>
          <li>ไม่ครอบคลุมการใช้งานเกินสเปก ผิดวัตถุประสงค์ หรือดัดแปลง/ซ่อมเอง</li>
          <li>ไม่ครอบคลุมอุบัติเหตุ ไฟไหม้ น้ำท่วม ไฟฟ้าลัดวงจร ฟ้าผ่า</li>
          <li>สติกเกอร์รับประกันต้องไม่ชำรุด ฉีกขาด หรือถูกแก้ไข</li>
        </PolicyBlock>
        <p className="md:col-span-3 rounded-lg bg-brand-50 px-4 py-3 text-brand-800">
          <strong>ข้อสงวนสิทธิ์:</strong> ไม่รับเปลี่ยน คืน หรือคืนเงิน กรณีสั่งซื้อผิดรุ่น ผิดสเปก ผิดขนาด หรือผิดประเภทสินค้า
          กรุณาตรวจสอบรายละเอียดก่อนสั่งซื้อทุกครั้ง
        </p>
      </div>
    </details>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-semibold text-slate-900">{title}</p>
      <ul className="list-disc space-y-1.5 pl-5 text-slate-600 leading-relaxed">{children}</ul>
    </div>
  );
}
