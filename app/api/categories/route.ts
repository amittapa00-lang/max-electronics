import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const parentId = formData.get("parentId") as string;

  await prisma.category.create({
    data: {
      name,
      parentId: parentId ? Number(parentId) : null,
    },
  });

  return NextResponse.redirect(
    new URL("/admin/categories", req.url)
  );
}