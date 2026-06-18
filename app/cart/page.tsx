import { prisma } from "@/lib/prisma";
import CartClient from "@/components/CartClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CartPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          session.user.email,
      },
    });

  if (!user) {
    redirect("/login");
  }

  const cartItems =
  await prisma.cartItem.findMany({
    where: {
      userId: user.id,
    },

    include: {
      product: {
        include: {
          images: true,
        },
      },
    },
  });

  return (
    <CartClient
      cartItems={cartItems}
    />
  );
}
