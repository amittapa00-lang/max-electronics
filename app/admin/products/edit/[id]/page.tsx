import { prisma } from "@/lib/prisma";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        category: true,
        images: true,
      },
    });

  if (!product) {
    return (
      <div>
        ไม่พบสินค้า
      </div>
    );
  }

 const categories =
  await prisma.category.findMany({
    include: {
      parent: true,
    },
  });

  return (
    <EditProductForm
      product={product}
      categories={categories}
    />
  );
}