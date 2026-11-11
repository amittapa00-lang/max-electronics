import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import {
  AlertTriangle,
  Eye,
  FileText,
  PackageCheck,
  PackageX,
  Plus,
  ShoppingBag,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import PeriodFilter from "@/components/admin/PeriodFilter";
import SalesTrendChart from "@/components/admin/SalesTrendChart";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { AdminPage, Card, PageHeader, StatCard, btn } from "@/components/admin/ui";
import { getPeriodRange, bucketItems, startOfDay, startOfMonth, type Period } from "@/lib/dateRange";

const sumTotal = (orders: { total: number }[]) => orders.reduce((s, o) => s + Number(o.total || 0), 0);

const dateFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });
const todayFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "full", timeZone: "Asia/Bangkok" });

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { period: periodParam, date: dateParam } = await searchParams;
  const period: Period = (["day", "week", "month", "year"].includes(periodParam || "") ? periodParam : "month") as Period;

  const now = new Date();
  const notCancelled = { status: { not: "CANCELLED" } };
  const { start: rangeStart, end: rangeEnd, label: rangeLabel } = getPeriodRange(period, dateParam);

  const [
    statusCounts,
    quotesPending,
    outOfStock,
    lowStock,
    todayOrders,
    monthOrders,
    ordersInRange,
    visitorsToday,
    visitorsMonth,
    recentOrders,
    bestAgg,
  ] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.quote.count({ where: { status: "PENDING" } }),
    prisma.product.findMany({ where: { stock: 0, quotationOnly: false }, orderBy: { name: "asc" }, select: { id: true, name: true, stock: true } }),
    prisma.product.findMany({ where: { stock: { gt: 0, lte: 5 } }, orderBy: { stock: "asc" }, select: { id: true, name: true, stock: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: startOfDay(now) }, ...notCancelled }, select: { total: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: startOfMonth(now) }, ...notCancelled }, select: { total: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: rangeStart, lt: rangeEnd }, ...notCancelled },
      select: { createdAt: true, total: true },
    }),
    prisma.pageView.count({ where: { createdAt: { gte: startOfDay(now) } } }),
    prisma.pageView.count({ where: { createdAt: { gte: startOfMonth(now) } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, total: true, status: true, createdAt: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: notCancelled },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const count = (s: string) => statusCounts.find((c) => c.status === s)?._count._all ?? 0;
  const bestNames = await prisma.product.findMany({
    where: { id: { in: bestAgg.map((b) => b.productId) } },
    select: { id: true, name: true },
  });
  const bestSelling = bestAgg.map((b) => ({
    id: b.productId,
    name: bestNames.find((p) => p.id === b.productId)?.name ?? "ไม่พบสินค้า",
    qty: b._sum.quantity ?? 0,
  }));

  const salesChartData = bucketItems(
    ordersInRange.map((o) => ({ createdAt: o.createdAt, total: Number(o.total || 0) })),
    period,
    rangeStart,
    rangeEnd,
    (o) => o.total
  );

  const todo = [
    { label: "รอตรวจสลิป", value: count("WAITING_VERIFY"), icon: Wallet, href: "/admin/orders?status=WAITING_VERIFY" },
    { label: "รอแพ็กสินค้า", value: count("PAID"), icon: PackageCheck, href: "/admin/orders?status=PAID" },
    { label: "รอใส่เลขพัสดุ", value: count("PREPARING"), icon: Truck, href: "/admin/orders?status=PREPARING" },
    { label: "ใบเสนอราคาใหม่", value: quotesPending, icon: FileText, href: "/admin/quotes?status=PENDING" },
    { label: "สินค้าหมด", value: outOfStock.length, icon: PackageX, href: "/admin/products?stock=out" },
  ];
  const todoTotal = todo.reduce((s, t) => s + t.value, 0);

  return (
    <AdminPage wide>
      <PageHeader
        title="ภาพรวมร้าน"
        description={todayFmt.format(now)}
        actions={
          <Link href="/admin/products/new" className={btn.primary}>
            <Plus className="h-4 w-4" /> เพิ่มสินค้า
          </Link>
        }
      />

      {/* งานที่ต้องทำ */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          งานที่ต้องทำ
          {todoTotal === 0 && <span className="font-normal text-emerald-600">— ไม่มีงานค้าง</span>}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {todo.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className={`flex items-center gap-3 rounded-xl border p-4 transition hover:shadow-sm ${
                t.value > 0 ? "border-brand-200 bg-brand-50 hover:border-brand-300" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <t.icon className={`h-6 w-6 shrink-0 ${t.value > 0 ? "text-brand-600" : "text-slate-300"}`} />
              <div className="min-w-0">
                <p className={`text-2xl font-bold ${t.value > 0 ? "text-brand-700" : "text-slate-400"}`}>{t.value}</p>
                <p className="truncate text-xs font-medium text-slate-600">{t.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ตัวเลขหลัก */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ยอดสั่งซื้อวันนี้" value={`฿${sumTotal(todayOrders).toLocaleString()}`} sub={`${todayOrders.length} คำสั่งซื้อ`} icon={TrendingUp} tone="emerald" />
        <StatCard label="ยอดสั่งซื้อเดือนนี้" value={`฿${sumTotal(monthOrders).toLocaleString()}`} sub={`${monthOrders.length} คำสั่งซื้อ`} icon={ShoppingBag} tone="brand" />
        <StatCard label="กำลังจัดส่ง" value={count("SHIPPING")} sub="รอลูกค้าได้รับ" icon={Truck} tone="sky" href="/admin/orders?status=SHIPPING" />
        <StatCard label="ผู้เข้าชมวันนี้" value={visitorsToday.toLocaleString()} sub={`เดือนนี้ ${visitorsMonth.toLocaleString()} ครั้ง`} icon={Eye} tone="slate" />
      </section>

      {/* รายงานยอดขาย */}
      <Card
        className="mb-6"
        title="รายงานยอดขาย"
        action={
          <Suspense fallback={<div className="h-10" />}>
            <PeriodFilter />
          </Suspense>
        }
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">ช่วงที่เลือก</p>
            <p className="font-semibold text-slate-800">{rangeLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">฿{sumTotal(ordersInRange).toLocaleString()}</p>
            <p className="text-xs text-slate-500">{ordersInRange.length} คำสั่งซื้อ (ไม่รวมที่ยกเลิก)</p>
          </div>
        </div>
        <SalesTrendChart data={salesChartData} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* คำสั่งซื้อล่าสุด */}
        <Card
          title="คำสั่งซื้อล่าสุด"
          padded={false}
          action={
            <Link href="/admin/orders?status=all" className="text-sm font-medium text-brand-700 hover:underline">
              ดูทั้งหมด
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">ยังไม่มีคำสั่งซื้อ</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        #{o.id} <span className="font-normal text-slate-600">{o.name}</span>
                      </p>
                      <p className="text-xs text-slate-500">{dateFmt.format(o.createdAt)}</p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                    <span className="w-20 text-right text-sm font-semibold text-slate-900">฿{o.total.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* สต็อก */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> สินค้าที่ต้องเติมสต็อก
            </span>
          }
          padded={false}
          action={
            <Link href="/admin/products?stock=low" className="text-sm font-medium text-brand-700 hover:underline">
              จัดการสต็อก
            </Link>
          }
        >
          {outOfStock.length + lowStock.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-emerald-600">สต็อกเพียงพอทุกรายการ</p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {[...outOfStock, ...lowStock].map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/edit/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-slate-50">
                    <span className="line-clamp-1 text-sm text-slate-800">{p.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.stock === 0 ? "หมด" : `เหลือ ${p.stock}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ขายดี */}
        <Card title="สินค้าขายดี (จำนวนชิ้น)" padded={false}>
          {bestSelling.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">ยังไม่มีข้อมูลการขาย</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {bestSelling.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <span className="line-clamp-1 flex-1 text-sm text-slate-800">{p.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{p.qty} ชิ้น</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}
