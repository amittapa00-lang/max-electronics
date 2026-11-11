import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChevronRight, ImageOff, Package } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { orderShippingFee } from "@/lib/shipping";

const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  });
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: { include: { images: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">คำสั่งซื้อของฉัน</h1>
      <p className="mt-1 text-sm text-slate-500">ติดตามสถานะและเลขพัสดุของคำสั่งซื้อทั้งหมด</p>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-base font-semibold text-slate-900">ยังไม่มีคำสั่งซื้อ</p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => {
            const firstItem = order.items[0];
            const img = firstItem?.product.images?.[0]?.imageUrl;
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
            // ใช้ค่าส่งตามที่บันทึกไว้ตอนสั่ง เพื่อให้ตรงกับหน้ารายละเอียดคำสั่งซื้อ
            const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
            const grandTotal = itemsTotal + orderShippingFee(order.total, itemsTotal, totalQty);

            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="group block rounded-xl border border-slate-200 bg-white transition-colors hover:border-brand-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">#{order.id}</span>
                      <span className="mx-1.5">·</span>
                      {dateFmt.format(order.createdAt)}
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 p-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={firstItem?.product.name || ""} className="h-full w-full object-contain p-1" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                          <ImageOff className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm sm:text-[15px] font-semibold leading-snug text-slate-900">
                        {firstItem?.product.name}
                        {firstItem?.variantName && <span className="font-normal text-slate-500"> ({firstItem.variantName})</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {order.items.length > 1 ? `และอีก ${order.items.length - 1} รายการ · ` : ""}
                        รวม {totalQty} ชิ้น
                      </p>
                      {order.trackingNumber && (
                        <p className="mt-1 text-xs text-slate-600">
                          เลขพัสดุ: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">ยอดรวม</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900">฿{grandTotal.toLocaleString()}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-600" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
