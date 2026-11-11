import { prisma } from "@/lib/prisma";
import { AdminPage, PageHeader } from "@/components/admin/ui";
import CategoryManager, { type CategoryNode } from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: true } },
      children: {
        include: { _count: { select: { products: true } } },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  const tree: CategoryNode[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    products: c._count.products,
    children: c.children.map((ch) => ({ id: ch.id, name: ch.name, products: ch._count.products })),
  }));

  const subCount = tree.reduce((s, c) => s + c.children.length, 0);

  return (
    <AdminPage>
      <PageHeader
        title="หมวดหมู่สินค้า"
        description={`หมวดหลัก ${tree.length} หมวด · หมวดย่อย ${subCount} หมวด — ลำดับในหน้านี้คือลำดับที่ลูกค้าเห็นบนหน้าร้าน`}
      />
      <CategoryManager initialCategories={tree} />
    </AdminPage>
  );
}
