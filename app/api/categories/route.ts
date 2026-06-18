import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(
  req: Request
) {
  const formData =
    await req.formData();

  const name =
    formData.get("name") as string;

  const parentId =
    formData.get("parentId") as string;

  await prisma.category.create({
    data: {
      name,

      parentId: parentId
        ? Number(parentId)
        : null,
    },
  });

  redirect("/admin/categories");
}