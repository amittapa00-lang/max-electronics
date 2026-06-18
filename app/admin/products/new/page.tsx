import { prisma } from "@/lib/prisma";
import NewProductForm from "./NewProductForm";

export default async function Page() {
  const categories =
  await prisma.category.findMany({
    include: {
      parent: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <NewProductForm
      categories={categories}
    />
  );
}