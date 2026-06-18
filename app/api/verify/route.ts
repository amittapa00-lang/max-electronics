import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request
) {

  const url =
    new URL(req.url);

  const token =
    url.searchParams.get(
      "token"
    );

  if (!token) {
    return NextResponse.redirect(
      new URL(
        "/login",
        req.url
      )
    );
  }

  const user =
    await prisma.user.findFirst({
      where: {
        verifyToken: token,
      },
    });

  if (!user) {
    return NextResponse.redirect(
      new URL(
        "/login",
        req.url
      )
    );
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      emailVerified: true,
      verifyToken: null,
    },
  });

  return NextResponse.redirect(
    new URL(
      "/login?verified=1",
      req.url
    )
  );
}