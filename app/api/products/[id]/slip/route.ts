import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const formData =
      await req.formData();

    const file =
      formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "ไม่พบไฟล์",
        },
        {
          status: 400,
        }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const fileName =
      uuidv4() +
      "-" +
      file.name;

    const uploadPath =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        fileName
      );

    await writeFile(
      uploadPath,
      buffer
    );

    const imageUrl =
      "/uploads/" +
      fileName;

    await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: {
        slip: imageUrl,
        status:
          "WAITING_VERIFY",
      },
    });

    return NextResponse.redirect(
      new URL(
        `/orders/${id}`,
        req.url
      )
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "อัปโหลดสลิปไม่สำเร็จ",
      },
      {
        status: 500,
      }
    );
  }
}