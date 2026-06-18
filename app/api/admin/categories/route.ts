import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(
  req: Request
) {
  const formData =
    await req.formData();

  const name =
    formData.get("name") as string;

  if (!name) {
    return Response.json(
      {
        error: "กรอกชื่อหมวดหมู่",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.category.create({
    data: {
      name,
    },
  });

  redirect("/admin/categories");
}