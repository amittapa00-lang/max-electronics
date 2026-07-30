import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Container from "@/components/Container";
import PeriodFilter from "@/components/admin/PeriodFilter";
import SalesTrendChart from "@/components/admin/SalesTrendChart";
import {
  getPeriodRange,
  bucketItems,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  type Period,
} from "@/lib/dateRange";

export default async function AdminPage({
  searchParams,
}: {
  // Next.js 15: searchParams เป็น Promise
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/");
  }

  const { period: periodParam, date: dateParam } = await searchParams;
  const period: Period = (["day", "week", "month", "year"].includes(
    periodParam || ""
  )
    ? periodParam
    : "month") as Period;

  const productCount = await prisma.product.count();

  const userCount = await prisma.user.count({
    where: { role: "USER" },
  });

  const orderCount = await prisma.order.count();

  const orders = await prisma.order.findMany();

  // ป้องกัน Error จากค่า Decimal ของ Prisma ด้วยการครอบ Number()
  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const today = new Date();
  const startOfToday = startOfDay(today);

  // ========== 1) สถิติผู้เข้าชมเว็บ (วัน / สัปดาห์ / เดือน / ปี) ==========
  const [visitorsToday, visitorsWeek, visitorsMonth, visitorsYear] =
    await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.pageView.count({
        where: { createdAt: { gte: startOfWeek(today) } },
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: startOfMonth(today) } },
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: startOfYear(today) } },
      }),
    ]);

  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfToday },
      status: { not: "CANCELLED" },
    },
  });

  const monthOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfMonth(today) },
      status: { not: "CANCELLED" },
    },
  });

  const todaySales = todayOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const monthSales = monthOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  // ========== 2) รายงานยอดขายแบบเลือกช่วงเวลาได้ ==========
  const { start: rangeStart, end: rangeEnd, label: rangeLabel } =
    getPeriodRange(period, dateParam);

  const ordersInRange = await prisma.order.findMany({
    where: {
      createdAt: { gte: rangeStart, lt: rangeEnd },
      status: { not: "CANCELLED" },
    },
  });

  const rangeSalesTotal = ordersInRange.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const salesChartData = bucketItems(
    ordersInRange.map((o) => ({ createdAt: o.createdAt, total: Number(o.total || 0) })),
    period,
    rangeStart,
    rangeEnd,
    (o) => o.total
  );

  // ========== 3) สินค้าขายดี / สินค้าขายไม่ได้ ==========
  const bestProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const bestSelling = await Promise.all(
    bestProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      return { name: product?.name || "ไม่พบสินค้า", qty: item._sum.quantity || 0 };
    })
  );

  // productId ทั้งหมดที่เคยขายได้ (ไม่นับออเดอร์ที่ถูกยกเลิก)
  const soldAgg = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
  });
  const soldProductIds = soldAgg
    .filter((s) => (s._sum.quantity || 0) > 0)
    .map((s) => s.productId);

  const neverSoldProducts = await prisma.product.findMany({
    where: { id: { notIn: soldProductIds } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const totalStock = await prisma.product.aggregate({ _sum: { stock: true } });

  const outOfStockProducts = await prisma.product.findMany({
    where: { stock: 0 },
    orderBy: { name: "asc" },
  });

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { gt: 0, lte: 5 } },
    orderBy: { stock: "asc" },
  });

  const todayItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
    },
    _sum: { quantity: true },
  });

  const todayProductSales = await Promise.all(
    todayItems.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      const price = Number(product?.price || 0);
      const qty = item._sum.quantity || 0;
      return { name: product?.name || "ไม่พบสินค้า", price, qty, total: price * qty };
    })
  );

  return (
    <Container>
      <main className="max-w-7xl mx-auto px-6 py-10 bg-linear-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">ระบบจัดการร้านค้าและสรุปสถิติภาพรวม</p>
        </div>

        {/* เมนูจัดการ */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link href="/admin/products" className="bg-white border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
            <h2 className="text-xl font-bold">📦 จัดการสินค้า</h2>
            <p className="text-gray-500 mt-2">เพิ่ม / แก้ไข / ลบสินค้า</p>
          </Link>
          <Link href="/admin/orders" className="bg-white border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
            <h2 className="text-xl font-bold">🛒 ออเดอร์</h2>
            <p className="text-gray-500 mt-2">ตรวจสอบคำสั่งซื้อ</p>
          </Link>
          <Link href="/admin/users" className="bg-white border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
            <h2 className="text-xl font-bold">👤 สมาชิก</h2>
            <p className="text-gray-500 mt-2">จัดการสมาชิก</p>
          </Link>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-6 mb-10">
          <div className="bg-blue-50 border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700">📦 สินค้า</h2>
            <p className="text-4xl font-bold mt-3">{productCount}</p>
          </div>
          <div className="bg-green-50 border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700">🛒 ออเดอร์</h2>
            <p className="text-4xl font-bold mt-3">{orderCount}</p>
          </div>
          <div className="bg-yellow-50 border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700">👤 สมาชิก</h2>
            <p className="text-4xl font-bold mt-3">{userCount}</p>
          </div>
          <div className="bg-cyan-50 border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700">📦 สต็อกรวม</h2>
            <p className="text-4xl font-bold mt-3">{totalStock._sum.stock || 0}</p>
          </div>
          <div className="bg-purple-50 border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700">💰 ยอดขายรวม</h2>
            <p className="text-3xl font-bold mt-3">฿{totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700">💵 วันนี้</h2>
            <p className="text-3xl font-bold mt-3 text-green-600">฿{todaySales.toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-700">📅 เดือนนี้</h2>
            <p className="text-3xl font-bold mt-3 text-blue-600">฿{monthSales.toLocaleString()}</p>
          </div>
        </div>

        {/* ========== ผู้เข้าชมเว็บ ========== */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
          <h2 className="text-2xl font-bold mb-6">👁️ ผู้เข้าชมเว็บไซต์</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500 text-sm">วันนี้</p>
              <p className="text-3xl font-bold mt-2 text-slate-800">{visitorsToday.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500 text-sm">สัปดาห์นี้</p>
              <p className="text-3xl font-bold mt-2 text-slate-800">{visitorsWeek.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500 text-sm">เดือนนี้</p>
              <p className="text-3xl font-bold mt-2 text-slate-800">{visitorsMonth.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500 text-sm">ปีนี้</p>
              <p className="text-3xl font-bold mt-2 text-slate-800">{visitorsYear.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            * นับจากจำนวนครั้งที่เปิดหน้าเว็บ (page view) ต้องติดตั้ง PageViewTracker ใน layout ก่อนจึงจะมีข้อมูล
          </p>
        </div>

        {/* ========== รายงานยอดขาย (เลือกช่วงเวลาได้) ========== */}
        <div id="sales-report" className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">📊 รายงานยอดขาย</h2>
            <Suspense fallback={<div className="h-10" />}>
              <PeriodFilter />
            </Suspense>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-slate-500 text-sm">ช่วงที่เลือก</p>
              <p className="font-semibold text-slate-700">{rangeLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm">ยอดขายรวมช่วงนี้</p>
              <p className="text-2xl font-bold text-green-600">฿{rangeSalesTotal.toLocaleString()}</p>
              <p className="text-xs text-slate-400">{ordersInRange.length} ออเดอร์</p>
            </div>
          </div>

          <SalesTrendChart data={salesChartData} />
        </div>

        {/* สินค้าหมด + ใกล้หมด */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-red-600 mb-4">❌ สินค้าหมด</h2>
            {outOfStockProducts.length === 0 ? (
              <p className="text-green-600">ไม่มีสินค้าหมด</p>
            ) : (
              <div className="space-y-3">
                {outOfStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between border-b pb-2">
                    <span>{product.name}</span>
                    <span className="font-bold text-red-600">0 ชิ้น</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">⚠️ สินค้าใกล้หมด</h2>
            {lowStockProducts.length === 0 ? (
              <p className="text-green-600">ไม่มีสินค้าใกล้หมด</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between border-b pb-2">
                    <span>{product.name}</span>
                    <span className="font-bold text-orange-600">เหลือ {product.stock} ชิ้น</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* รายงานยอดขายวันนี้ */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📊 รายงานยอดขายวันนี้</h2>
            <div className="text-green-600 font-semibold">฿{todaySales.toLocaleString()}</div>
          </div>

          {todayProductSales.length === 0 ? (
            <p className="text-gray-500">วันนี้ยังไม่มีรายการขาย</p>
          ) : (
            <div className="space-y-3">
              {todayProductSales.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">ขาย {item.qty} ชิ้น</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">฿{item.total.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========== สินค้าขายดี / สินค้าขายไม่ได้ ========== */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">🔥 สินค้าขายดี</h2>
            {bestSelling.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีข้อมูลการขาย</p>
            ) : (
              <div className="space-y-4">
                {bestSelling.map((product, index) => (
                  <div key={index} className="flex justify-between border-b pb-3">
                    <span>{index + 1}. {product.name}</span>
                    <span className="font-bold text-blue-600">{product.qty} ชิ้น</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-500 mb-6">💤 สินค้าขายไม่ได้</h2>
            {neverSoldProducts.length === 0 ? (
              <p className="text-green-600">ทุกสินค้าขายได้แล้ว 🎉</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {neverSoldProducts.map((product) => (
                  <div key={product.id} className="flex justify-between border-b pb-2">
                    <span>{product.name}</span>
                    <span className="text-xs text-slate-400">สต็อก {product.stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </Container>
  );
}