import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminProductsPage() {
const products = await prisma.product.findMany({
include: {
category: true,
orderItems: true,
},
orderBy: {
createdAt: "desc",
},
});

const categories =
await prisma.category.findMany({
orderBy: {
name: "asc",
},
});

const outOfStock =
products.filter(
(p) => p.stock === 0
).length;

const lowStock =
products.filter(
(p) =>
p.stock > 0 &&
p.stock <= 5
).length;

const bestSelling =
products
.map((product) => ({
...product,
sold:
product.orderItems.reduce(
(sum, item) =>
sum + item.quantity,
0
),
}))
.sort(
(a, b) =>
b.sold - a.sold
)[0];

return ( <main className="max-w-7xl mx-auto px-6 py-10">


  <div className="flex justify-between items-center mb-8">

    <div>
      <h1 className="text-4xl font-bold">
        จัดการสินค้า
      </h1>

      <p className="text-gray-500 mt-2">
        จัดการสินค้า ค้นหา แก้ไข และตรวจสอบสต็อก
      </p>
    </div>

    <Link
      href="/admin/products/new"
      className="
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-5
        py-3
        rounded-xl
        font-semibold
      "
    >
      + เพิ่มสินค้า
    </Link>

  </div>

  {/* Dashboard */}

  <div className="grid md:grid-cols-4 gap-5 mb-8">

    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="text-gray-500">
        สินค้าทั้งหมด
      </div>

      <div className="text-4xl font-bold mt-2">
        {products.length}
      </div>
    </div>

    <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
      <div className="text-red-600">
        สินค้าหมด
      </div>

      <div className="text-4xl font-bold mt-2 text-red-600">
        {outOfStock}
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
      <div className="text-orange-600">
        ใกล้หมด
      </div>

      <div className="text-4xl font-bold mt-2 text-orange-600">
        {lowStock}
      </div>
    </div>

    <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
      <div className="text-green-700">
        สินค้าขายดี
      </div>

      <div className="font-bold mt-2">
        {bestSelling?.name || "-"}
      </div>

      <div className="text-green-600 text-sm mt-1">
        ขายแล้ว {bestSelling?.sold || 0} ชิ้น
      </div>
    </div>

  </div>

  {/* Filter */}

  <div className="bg-white border rounded-2xl p-5 mb-8 shadow-sm">

    <div className="grid md:grid-cols-4 gap-4">

      <input
        placeholder="ค้นหาสินค้า..."
        className="
          border
          rounded-xl
          px-4
          py-3
        "
      />

      <select
        className="
          border
          rounded-xl
          px-4
          py-3
        "
      >
        <option>
          ทุกหมวดหมู่
        </option>

        {categories.map((cat) => (
          <option
            key={cat.id}
          >
            {cat.name}
          </option>
        ))}
      </select>

      <select
        className="
          border
          rounded-xl
          px-4
          py-3
        "
      >
        <option>
          ทุกสถานะ
        </option>

        <option>
          สินค้าหมด
        </option>

        <option>
          สินค้าใกล้หมด
        </option>

        <option>
          สินค้าปกติ
        </option>
      </select>

      <button
        className="
          bg-blue-600
          text-white
          rounded-xl
        "
      >
        ค้นหา
      </button>

    </div>

  </div>

  {/* Table */}

  <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">

    <table className="w-full">

      <thead>

        <tr className="bg-gray-50">

          <th className="text-left p-4">
            สินค้า
          </th>

          <th className="text-left p-4">
            หมวดหมู่
          </th>

          <th className="text-left p-4">
            ราคา
          </th>

          <th className="text-left p-4">
            สต็อก
          </th>

          <th className="text-left p-4">
            ขายแล้ว
          </th>

          <th className="text-left p-4">
            จัดการ
          </th>

        </tr>

      </thead>

      <tbody>

        {products.map((product) => {

          const sold =
            product.orderItems.reduce(
              (sum, item) =>
                sum +
                item.quantity,
              0
            );

          return (
            <tr
              key={product.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-4 font-medium">
                {product.name}
              </td>

              <td className="p-4">
                {product.category.name}
              </td>

              <td className="p-4">
                ฿{product.price.toLocaleString()}
              </td>

              <td className="p-4">

                {product.stock === 0 ? (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                    หมด
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="bg-yellow-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                    เหลือ {product.stock}
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                    {product.stock}
                  </span>
                )}

              </td>

              <td className="p-4">
                {sold}
              </td>

              <td className="p-4">

                <div className="flex gap-3">

                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    แก้ไข
                  </Link>

                  <DeleteButton
                    id={product.id}
                  />

                </div>

              </td>

            </tr>
          );
        })}

      </tbody>

    </table>

  </div>

</main>


);
}
