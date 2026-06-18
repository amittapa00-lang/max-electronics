import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories =
    await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          จัดการหมวดหมู่สินค้า
        </h1>

        <p className="text-gray-500 mt-2">
          เพิ่ม แก้ไข และลบหมวดหมู่สินค้า
        </p>
      </div>

      {/* Add Category */}

      <div
        className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          p-6
          mb-10
        "
      >
        <h2 className="text-xl font-bold mb-5">
          ➕ เพิ่มหมวดหมู่ใหม่
        </h2>

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
            className="
              flex-1
              min-w-[250px]
              border
              rounded-xl
              px-4
              py-3
            "
          />

          <select
            name="parentId"
            className="
              border
              rounded-xl
              px-4
              py-3
              min-w-[220px]
            "
          >
            <option value="">
              หมวดหลัก
            </option>

            {categories.map((cat) => (
              <option
                key={cat.id}
                value={cat.id}
              >
                {cat.name}
              </option>
            ))}
          </select>

          <button
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-6
              py-3
              rounded-xl
              font-medium
            "
          >
            เพิ่มหมวดหมู่
          </button>
        </form>
      </div>

      {/* Categories */}

      <div className="space-y-6">

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="
              bg-white
              border
              rounded-2xl
              shadow-sm
              overflow-hidden
            "
          >

            {/* Main Category */}

            <div
              className="
                flex
                items-center
                justify-between
                p-6
                bg-gradient-to-r
                from-blue-50
                to-white
              "
            >

              <div>
                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-12
                      h-12
                      rounded-xl
                      bg-blue-100
                      flex
                      items-center
                      justify-center
                      text-2xl
                    "
                  >
                    📁
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      {cat.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      หมวดหลัก • {cat.children.length} หมวดย่อย
                    </p>
                  </div>

                </div>
              </div>

              <div className="flex gap-2">

                <Link
                  href={`/admin/categories/${cat.id}/edit`}
                  className="
                    px-4
                    py-2
                    rounded-lg
                    bg-blue-50
                    text-blue-600
                    hover:bg-blue-100
                    font-medium
                  "
                >
                  ✏️ แก้ไข
                </Link>

                <form
  action={`/api/admin/categories/${cat.id}`}
  method="POST"
>
  <button
    className="
      px-4
      py-2
      rounded-lg
      bg-red-50
      text-red-600
      hover:bg-red-100
      font-medium
    "
  >
    🗑️ ลบ
  </button>
</form>
               

              </div>

            </div>

            {/* Sub Categories */}

            {cat.children.length > 0 && (
              <div className="p-6 border-t">

                <div className="text-sm font-semibold text-gray-500 mb-4">
                  หมวดย่อย
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">

                  {cat.children.map((sub) => (
                    <div
                      key={sub.id}
                      className="
                        border
                        rounded-xl
                        px-4
                        py-3
                        flex
                        items-center
                        justify-between
                        bg-gray-50
                      "
                    >

                      <div className="flex items-center gap-2">

                        <span className="text-gray-400">
                          📂
                        </span>

                        <span className="font-medium">
                          {sub.name}
                        </span>

                      </div>

                      <div className="flex gap-3">

                        <Link
                          href={`/admin/categories/${sub.id}/edit`}
                          className="
                            text-blue-600
                            hover:text-blue-800
                            text-sm
                            font-medium
                          "
                        >
                          แก้ไข
                        </Link>

                        <form
                          action={`/api/admin/categories/${sub.id}`}
                          method="POST"
                        >
                          <button
                            className="
                              text-red-600
                              hover:text-red-800
                              text-sm
                              font-medium
                            "
                          >
                            ลบ
                          </button>
                        </form>

                      </div>

                    </div>
                  ))}

                </div>

              </div>
            )}

          </div>
        ))}

      </div>

    </main>
  );
}