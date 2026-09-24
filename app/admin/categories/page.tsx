import { prisma } from "@/lib/prisma";
import CategoryManager from "./CategoryManager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">จัดการหมวดหมู่สินค้า</h1>

        <p className="text-gray-500 mt-2">
          เพิ่ม แก้ไข ลบ และลากเพื่อจัดลำดับการแสดงหมวดหมู่สินค้า
        </p>
      </div>

      {/* Add Category */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 mb-10">
        <h2 className="text-xl font-bold mb-5">➕ เพิ่มหมวดหมู่ใหม่</h2>

        <form
          action="/api/categories"
          method="POST"
          className="flex flex-wrap gap-3"
        >
          <input
            type="text"
            name="name"
            placeholder="ชื่อหมวดหมู่"
            required
            className="flex-1 min-w-250px border rounded-xl px-4 py-3"
          />

          <select
            name="parentId"
            className="border rounded-xl px-4 py-3 min-w-220px"
          >
            <option value="">หมวดหลัก</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium">
            เพิ่มหมวดหมู่
          </button>
        </form>
      </div>

      {/* Categories - ลากเพื่อจัดลำดับได้ */}
      <CategoryManager initialCategories={categories} />
    </main>
  );
}