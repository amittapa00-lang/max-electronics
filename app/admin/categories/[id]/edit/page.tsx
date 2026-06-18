import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const category =
    await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
    });

  if (!category) {
    notFound();
  }

  return (
    <main className="max-w-xl mx-auto py-10">

      <h1 className="text-3xl font-bold mb-6">
        แก้ไขหมวดหมู่
      </h1>

      <form
  action={`/api/admin/categories/${category.id}`}
  method="POST"
>
        <input
          type="hidden"
          name="_method"
          value="PUT"
        />

        <input
          name="name"
          defaultValue={category.name}
          className="
            w-full
            border
            p-3
            rounded-lg
          "
        />

        <button
          className="
            mt-4
            bg-blue-600
            text-white
            px-6
            py-3
            rounded-lg
          "
        >
          บันทึก
        </button>

      </form>

    </main>
  );
}