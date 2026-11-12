import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PrintButton from "@/components/admin/PrintButton";
import { btn } from "@/components/admin/ui";
import ShippingLabel, { labelCss, type LabelSize as Size } from "@/components/admin/ShippingLabel";

export const metadata = { title: "พิมพ์ใบปะหน้า" };

const SIZES: { key: Size; label: string; hint: string }[] = [
  { key: "100x150", label: "สติกเกอร์ 100×150 มม.", hint: "เครื่องพิมพ์ความร้อน 1 ดวง/หน้า" },
  { key: "a4", label: "กระดาษ A4", hint: "2 ใบ/หน้า ตัดตามเส้นประ" },
];

export default async function OrderLabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; size?: string }>;
}) {
  const { ids: idsParam = "", size: sizeParam } = await searchParams;
  const size: Size = sizeParam === "a4" ? "a4" : "100x150";
  const ids = [...new Set(idsParam.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 100);

  const found = ids.length
    ? await prisma.order.findMany({
        where: { id: { in: ids } },
        include: { items: { include: { product: { select: { name: true, productCode: true } } }, orderBy: { id: "asc" } } },
      })
    : [];
  // เรียงตามลำดับที่ส่งมา
  const orders = ids.map((id) => found.find((o) => o.id === id)).filter((o) => !!o);

  const sizeHref = (s: Size) => `/admin/orders/labels?ids=${ids.join(",")}&size=${s}`;
  const back = orders.length === 1 ? `/admin/orders/${orders[0].id}` : "/admin/orders";

  const labels = orders.map((o) => <ShippingLabel key={o.id} order={o} size={size} />);
  // A4: จับคู่ 2 ใบต่อแผ่น
  const sheets =
    size === "a4"
      ? Array.from({ length: Math.ceil(labels.length / 2) }, (_, i) => (
          <div key={i} className="label-sheet">
            {labels[i * 2]}
            {labels[i * 2 + 1] && <div className="cut-line" />}
            {labels[i * 2 + 1]}
          </div>
        ))
      : labels;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 print:m-0 print:max-w-none print:p-0">
      <style>{labelCss(size)}</style>

      {/* แถบเครื่องมือ (ไม่พิมพ์) */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <Link href={back} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
            ← กลับ
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">พิมพ์ใบปะหน้า</h1>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length > 0
              ? `${orders.length} คำสั่งซื้อ · ${orders.map((o) => `#${o.id}`).join(", ")}`
              : "ไม่พบคำสั่งซื้อ"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-300 bg-white p-0.5">
            {SIZES.map((s) => (
              <Link
                key={s.key}
                href={sizeHref(s.key)}
                title={s.hint}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                  s.key === size ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
          {orders.length > 0 && <PrintButton label={`พิมพ์ ${orders.length} ใบ`} />}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 print:hidden">
          ไม่พบคำสั่งซื้อที่เลือก{" "}
          <Link href="/admin/orders" className={`${btn.secondary} ml-2`}>
            ไปหน้าคำสั่งซื้อ
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500 print:hidden">
            ตอนสั่งพิมพ์: ตั้ง <b>ขนาดกระดาษ</b> เป็น {size === "a4" ? "A4" : "100×150 มม. (4×6 นิ้ว)"} ·{" "}
            <b>ระยะขอบ</b> = ไม่มี/ค่าเริ่มต้น · <b>มาตราส่วน</b> 100% · ปิด “ส่วนหัวและส่วนท้าย”
          </p>
          <div className="label-stack">{sheets}</div>
        </>
      )}
    </main>
  );
}
