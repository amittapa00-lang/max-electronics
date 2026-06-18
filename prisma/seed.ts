import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      name: "PLC",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Mitsubishi FX5U",
        slug: "mitsubishi-fx5u",
        description: "PLC Controller",
        image: "/products/fx5u.jpg",
        price: 12900,
        stock: 10,
        categoryId: category.id,
      },
      {
        name: "Delta VFD",
        slug: "delta-vfd",
        description: "Inverter",
        image: "/products/vfd.jpg",
        price: 8900,
        stock: 15,
        categoryId: category.id,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

  