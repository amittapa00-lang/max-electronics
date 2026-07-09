import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

function calcShippingFee(totalQty: number): number {
  if (totalQty <= 2) return 100;
  return 100 + (totalQty - 2) * 50;
}

const statusMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
  PENDING:        { label: "รอชำระเงิน",      bg: "#FAEEDA", color: "#633806", border: "#FAC775" },
  WAITING_VERIFY: { label: "รอตรวจสลิป",      bg: "#FAEEDA", color: "#633806", border: "#FAC775" },
  PAID:           { label: "ชำระเงินแล้ว",    bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
  PREPARING:      { label: "กำลังเตรียมสินค้า", bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
  SHIPPING:       { label: "กำลังจัดส่ง",     bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
  COMPLETED:      { label: "จัดส่งสำเร็จ",    bg: "#EAF3DE", color: "#27500A", border: "#97C459" },
  CANCELLED:      { label: "ยกเลิกแล้ว",      bg: "#FCEBEB", color: "#791F1F", border: "#F09595" },
};

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
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">ประวัติคำสั่งซื้อ</h1>

      {orders.length === 0 ? (
        <div className="border rounded-xl p-6 text-center text-gray-400">
          ยังไม่มีคำสั่งซื้อ
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items[0];
            const imgSrc =
              firstItem?.product.images?.[0]?.imageUrl || "/uploads/no-image.jpg";

            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
            // ✅ คำนวณราคาสินค้ารวมจากรายการ items จริง แทนการใช้ order.total ตรงๆ
            // เพื่อให้ยอดรวมตรงกับหน้ารายละเอียดคำสั่งซื้อเสมอ
            const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
            const shippingFee = calcShippingFee(totalQty);
            const grandTotal = itemsTotal + shippingFee;

            const badge = statusMap[order.status] ?? {
              label: order.status, bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db",
            };

            return (
              <div key={order.id} className="bg-white border rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between gap-4">

                  {/* รูป + ข้อมูล */}
                  <div className="flex gap-4 items-center min-w-0">
                    <Image
                      src={imgSrc}
                      alt={firstItem?.product.name || ""}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-xl border shrink-0"
                    />

                    <div className="min-w-0">
                      {/*  วันที่ */}
                      <h2 className="font-bold text-lg truncate">
                        {firstItem?.product.name}
                      </h2>

                      {order.items.length > 1 && (
                        <p className="text-gray-400 text-sm">
                          และอีก {order.items.length - 1} รายการ
                        </p>
                      )}

                      {/* Status badge */}
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        marginTop: 6, fontSize: 12, fontWeight: 500,
                        padding: "3px 10px", borderRadius: 20,
                        border: `0.5px solid ${badge.border}`,
                        background: badge.bg, color: badge.color,
                      }}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* ราคา + ปุ่ม */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">รวมค่าส่ง</p>
                      <p className="text-xl font-bold text-green-600">
                        ฿{grandTotal.toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}