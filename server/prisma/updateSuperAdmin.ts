import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updatedUser = await prisma.user.update({
    where: { email: "david.polcer@cyberdev.cz" },
    data: { role: Role.SUPERADMIN },
  });

  console.log("Uživatel aktualizován:", updatedUser);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());