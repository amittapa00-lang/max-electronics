import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { id } = await params;

  const formData = await req.formData();

  const name =
    formData.get("name") as string;

  // ถ้ามี name = แก้ไข
  if (name) {
    await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });

    redirect("/admin/categories");
  }

  // ถ้าไม่มี name = ลบ
  await prisma.category.delete({
    where: {
      id: Number(id),
    },
  });

  redirect("/admin/categories");
}