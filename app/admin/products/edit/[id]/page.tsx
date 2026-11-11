import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { id: "asc" } }, variants: { orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      categories={categories}
      initial={{
        id: product.id,
        name: product.name,
        productCode: product.productCode ?? "",
        description: product.description,
        price: String(product.price),
        stock: String(product.stock),
        quotationOnly: product.quotationOnly,
        categoryId: String(product.categoryId),
        images: product.images.map((i) => i.imageUrl),
        variants: product.variants.map((x) => ({
          id: x.id,
          name: x.name,
          sku: x.sku ?? "",
          price: x.price === null ? "" : String(x.price),
          stock: String(x.stock),
          imageUrl: x.imageUrl ?? "",
        })),
      }}
    />
  );
}
