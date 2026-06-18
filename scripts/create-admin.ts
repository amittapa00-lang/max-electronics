import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const password =
    await bcrypt.hash(
      "123456",
      10
    );

  await prisma.user.upsert({
    where: {
      email:
        "admin@max.com",
    },
    update: {},

    create: {
      name: "Admin",
      email:
        "admin@max.com",
      password,
      role: "ADMIN",
    },
  });

  console.log(
    "Admin Created"
  );
}

main();