import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  console.log("UPLOAD WORKING");

  try {
    const data = await req.formData();

    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName =
      uuidv4() + "-" + file.name;

    const uploadPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      fileName
    );

    await writeFile(uploadPath, buffer);

    return NextResponse.json({
      imageUrl: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload Error" },
      { status: 500 }
    );
  }
}