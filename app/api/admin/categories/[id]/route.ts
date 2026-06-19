import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const formData = await req.formData();
  const name = formData.get("name") as string;

  if (name) {
    await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });
  } else {
    await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });
  }

  return NextResponse.redirect(
    new URL("/admin/categories", req.url)
  );
}