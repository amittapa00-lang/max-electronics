import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AdminShippingForm from "@/components/AdminShippingForm";

function calcShippingFee(totalQty: number): number {
  if (totalQty <= 2) return 100;
  return 100 + (totalQty - 2) * 50;
}

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

  const statusMap = {
    PENDING:        { label: "🟡 รอชำระเงิน",        color: "bg-yellow-100 text-yellow-700" },
    WAITING_VERIFY: { label: "🟠 รอตรวจสอบสลิป",     color: "bg-orange-100 text-orange-700" },
    PAID:           { label: "🟢 ชำระเงินแล้ว",       color: "bg-green-100 text-green-700" },
    PREPARING:      { label: "📦 เตรียมสินค้า",       color: "bg-indigo-100 text-indigo-700" },
    SHIPPING:       { label: "🚚 กำลังจัดส่ง",        color: "bg-blue-100 text-blue-700" },
    COMPLETED:      { label: "✅ จัดส่งสำเร็จ",       color: "bg-purple-100 text-purple-700" },
    CANCELLED:      { label: "❌ ยกเลิกคำสั่งซื้อ",   color: "bg-red-100 text-red-700" },
  };

  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = calcShippingFee(totalQty);
  const grandTotal = total + shippingFee;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">จัดการ Order #{order.id}</h1>
          <p className="text-gray-500 mt-2">
            รายละเอียดคำสั่งซื้อ • วันที่สั่งซื้อ{" "}
            {new Date(order.createdAt).toLocaleDateString("th-TH", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* สถานะ + ข้อมูลผู้รับ */}
        <div className="bg-white rounded-2xl shadow border p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusMap[order.status as keyof typeof statusMap]?.color}`}>
              {statusMap[order.status as keyof typeof statusMap]?.label}
            </span>
          </div>
          <p><strong>ผู้รับ :</strong> {order.name}</p>
          <p className="mt-2"><strong>เบอร์โทร :</strong> {order.phone}</p>
          <p className="mt-2"><strong>ที่อยู่ :</strong> {order.address}</p>
        </div>

        {/* ยกเลิก */}
        {order.status === "CANCELLED" && (
          <div className="mb-8 bg-red-50 border border-red-300 rounded-xl p-6">
            <h2 className="font-bold text-red-600 text-xl mb-2">❌ คำสั่งซื้อถูกยกเลิกแล้ว</h2>
            <p className="text-red-500">ลูกค้าเป็นผู้ยกเลิกคำสั่งซื้อเอง</p>
          </div>
        )}

        {/* สลิป */}
        {order.slip && (
          <div className="bg-white rounded-2xl shadow border p-6 mb-8">
            <h2 className="font-bold text-xl mb-4">💳 สลิปการโอนเงิน</h2>
            <Image
              src={order.slip}
              alt="Slip"
              width={600}
              height={400}
              className="w-full max-w-xl rounded-xl border"
              style={{ height: "auto" }}
            />
          </div>
        )}

        {/* รายการสินค้า */}
        <div className="bg-white rounded-2xl shadow border p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">📦 รายการสินค้า</h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <Image
                    src={item.product.images?.[0]?.imageUrl || "/uploads/no-image.jpg"}
                    alt={item.product.name}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-xl border"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{item.product.name}</h3>
                    <p className="text-gray-500">จำนวน {item.quantity} ชิ้น</p>
                    <p>
                      สถานะ :
                      <span className="ml-2 font-semibold text-blue-600">
                        {statusMap[order.status as keyof typeof statusMap]?.label}
                      </span>
                    </p>
                    <p>
                      ราคา/ชิ้น :
                      <span className="ml-2 font-bold">฿{item.price.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">ราคารวม</p>
                  <p className="text-2xl font-bold text-green-600">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* สรุปยอด */}
          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">ราคาสินค้า</span>
              <span>฿{total.toLocaleString()}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-600">
                ค่าจัดส่ง ({totalQty} ชิ้น · {totalQty <= 2 ? "1–2 ชิ้นแรก" : `+${totalQty - 2} ชิ้น × ฿50`})
              </span>
              <span className="text-orange-600 font-bold">฿{shippingFee.toLocaleString()}</span>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-xl font-bold">รวมทั้งหมด</span>
              <span className="text-3xl font-bold text-green-600">฿{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* จัดการสถานะ */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white rounded-2xl shadow border p-6 mb-8">
            <h2 className="text-xl font-bold mb-5">⚙️ จัดการสถานะ</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <form action={`/api/admin/orders/${order.id}/status`} method="POST">
                <input type="hidden" name="status" value="PAID" />
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold">
                  ✅ อนุมัติการชำระเงิน
                </button>
              </form>

              <form action={`/api/admin/orders/${order.id}/status`} method="POST">
                <input type="hidden" name="status" value="SHIPPING" />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold">
                  🚚 กำลังจัดส่ง
                </button>
              </form>

              <form action={`/api/admin/orders/${order.id}/status`} method="POST">
                <input type="hidden" name="status" value="COMPLETED" />
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition">
                  🎉 จัดส่งสำเร็จ
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ข้อมูลการจัดส่ง */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white rounded-2xl shadow border p-6">
            <h2 className="text-xl font-bold mb-4">🚚 ข้อมูลการจัดส่ง</h2>

            {order.trackingNumber && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-bold text-green-700 mb-3">🚚 เลขพัสดุปัจจุบัน</h3>
                <p><strong>บริษัทขนส่ง :</strong> {order.shippingCompany || "-"}</p>
                <p className="mt-2">
                  <strong>เลขพัสดุ :</strong>{" "}
                  <span className="font-bold text-blue-600 text-lg">{order.trackingNumber}</span>
                </p>
              </div>
            )}

            <AdminShippingForm orderId={order.id} />
          </div>
        )}

      </div>
    </main>
  );
}