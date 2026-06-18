import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
  status?: string;
  search?: string;
}>;
}) {

  const session =
  await getServerSession(
    authOptions
  );

  const {
  status,
  search,
} = await searchParams;

  const role = (
    session?.user as {
      role?: string;
    } | undefined
  )?.role;

  if (role !== "ADMIN") {
    redirect("/");
  }

const orders =
  await prisma.order.findMany({
    where: {
      ...(status
        ? {
            status,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                id: Number(search) || 0,
              },
              {
                user: {
                  name: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {}),
    },

    include: {
      user: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

    const statusMap = {
  PENDING: {
    label: "🟡 รอชำระเงิน",
    color: "bg-yellow-100 text-yellow-700",
  },
  WAITING_VERIFY: {
    label: "🟠 รอตรวจสอบสลิป",
    color: "bg-orange-100 text-orange-700",
  },
  PAID: {
    label: "🟢 ชำระเงินแล้ว",
    color: "bg-green-100 text-green-700",
  },
  PREPARING: {
    label: "📦 กำลังเตรียมสินค้า",
    color: "bg-indigo-100 text-indigo-700",
  },
  SHIPPING: {
    label: "🚚 จัดส่งแล้ว",
    color: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    label: "✅ สำเร็จ",
    color: "bg-purple-100 text-purple-700",
  },
  CANCELLED: {
    label: "❌ ยกเลิก",
    color: "bg-red-100 text-red-700",
  },
};

const preparingCount =
  await prisma.order.count({
    where: {
      status: "PREPARING",
    },
  });

const waitingCount =
  await prisma.order.count({
    where: {
      status: "WAITING_VERIFY",
    },
  });

const shippingCount =
  await prisma.order.count({
    where: {
      status: "SHIPPING",
    },
  });
  

const cancelCount =
  await prisma.order.count({
    where: {
      status: "CANCELLED",
    },
  });

  const totalCount =
  await prisma.order.count();

  return (

  <main className="max-w-7xl mx-auto px-6 py-8">


{/* Header */}
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-4xl font-bold text-slate-800">
      จัดการคำสั่งซื้อ
    </h1>

    <p className="text-slate-500 mt-1">
      รายการคำสั่งซื้อทั้งหมด ({totalCount} รายการ)
    </p>
  </div>
</div>

{/* Search */}
<div className="bg-white border rounded-xl p-4 mb-6">
  <form method="GET" className="flex gap-3">

    <input
      type="text"
      name="search"
      defaultValue={search}
      placeholder="ค้นหาเลข Order หรือชื่อลูกค้า..."
      className="
        flex-1
        border
        rounded-lg
        px-4
        py-2
      "
    />

    {status && (
      <input
        type="hidden"
        name="status"
        value={status}
      />
    )}

    <button
      className="
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-6
        rounded-lg
        transition
      "
    >
      ค้นหา
    </button>

  </form>
</div>

{/* Stats */}
<div className="grid md:grid-cols-4 gap-4 mb-6">

  <div className="bg-orange-50 border rounded-xl p-5">
    <p className="text-sm text-slate-500">
      รอตรวจสอบสลิป
    </p>

    <p className="text-3xl font-bold text-orange-600 mt-2">
      {waitingCount}
    </p>
  </div>

  <div className="bg-indigo-50 border rounded-xl p-5">
    <p className="text-sm text-slate-500">
      กำลังเตรียมสินค้า
    </p>

    <p className="text-3xl font-bold text-indigo-600 mt-2">
      {preparingCount}
    </p>
  </div>

  <div className="bg-blue-50 border rounded-xl p-5">
    <p className="text-sm text-slate-500">
      กำลังจัดส่ง
    </p>

    <p className="text-3xl font-bold text-blue-600 mt-2">
      {shippingCount}
    </p>
  </div>

  <div className="bg-red-50 border rounded-xl p-5">
    <p className="text-sm text-slate-500">
      ยกเลิก
    </p>

    <p className="text-3xl font-bold text-red-600 mt-2">
      {cancelCount}
    </p>
  </div>

</div>

{/* Filter */}
<div className="flex flex-wrap gap-2 mb-6">

  <Link
    href="/admin/orders"
    className={`px-4 py-2 rounded-lg border transition ${
      !status
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white hover:bg-slate-50"
    }`}
  >
    ทั้งหมด
  </Link>

  <Link
    href="/admin/orders?status=WAITING_VERIFY"
    className={`px-4 py-2 rounded-lg border transition ${
      status === "WAITING_VERIFY"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white hover:bg-slate-50"
    }`}
  >
    รอตรวจสอบ
  </Link>

  <Link
    href="/admin/orders?status=PREPARING"
    className={`px-4 py-2 rounded-lg border transition ${
      status === "PREPARING"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white hover:bg-slate-50"
    }`}
  >
    เตรียมสินค้า
  </Link>

  <Link
    href="/admin/orders?status=SHIPPING"
    className={`px-4 py-2 rounded-lg border transition ${
      status === "SHIPPING"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white hover:bg-slate-50"
    }`}
  >
    จัดส่ง
  </Link>

  <Link
    href="/admin/orders?status=COMPLETED"
    className={`px-4 py-2 rounded-lg border transition ${
      status === "COMPLETED"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white hover:bg-slate-50"
    }`}
  >
    สำเร็จ
  </Link>

  <Link
    href="/admin/orders?status=CANCELLED"
    className={`px-4 py-2 rounded-lg border transition ${
      status === "CANCELLED"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white hover:bg-slate-50"
    }`}
  >
    ยกเลิก
  </Link>

</div>

{/* Orders */}
<div className="space-y-4">

  {orders.map((order) => (
    <div
      key={order.id}
      className="
        bg-white
        border
        rounded-xl
        p-5
        hover:border-blue-300
        transition
      "
    >
      <div className="flex justify-between items-center">

        <div>

          <div className="flex items-center gap-3 mb-2">

            <h2 className="font-bold text-lg">
              Order #{order.id}
            </h2>

            <div
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                statusMap[
                  order.status as keyof typeof statusMap
                ]?.color
              }`}
            >
              {
                statusMap[
                  order.status as keyof typeof statusMap
                ]?.label
              }
            </div>

          </div>

          <p className="font-medium">
            {order.user.name}
          </p>

          <p className="text-sm text-slate-500">
            {order.user.email}
          </p>

          <p className="text-sm text-slate-400 mt-1">
            {new Date(
              order.createdAt
            ).toLocaleDateString("th-TH")}
          </p>

          {order.trackingNumber && (
            <p className="text-blue-600 text-sm mt-2">
              🚚 {order.trackingNumber}
            </p>
          )}
        </div>

        <div className="text-right">

          <p className="text-2xl font-bold text-green-600">
            ฿{order.total.toLocaleString()}
          </p>

          <Link
            href={`/admin/orders/${order.id}`}
            className="
              inline-block
              mt-3
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-2
              rounded-lg
              transition
            "
          >
            ดูรายละเอียด
          </Link>

        </div>

      </div>
    </div>
  ))}

</div>


  </main>
);

}