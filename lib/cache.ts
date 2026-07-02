import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      include: {
        images: true,
        category: {
          include: { parent: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  ["products"],
  {
    revalidate: 300, // Cache 5 นาที
  }
);