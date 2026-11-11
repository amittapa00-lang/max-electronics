import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, parentId: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <ProductForm
      categories={categories}
      initial={{
        name: "",
        productCode: "",
        description: "",
        price: "",
        stock: "",
        quotationOnly: false,
        categoryId: "",
        images: [],
        variants: [],
      }}
    />
  );
}
