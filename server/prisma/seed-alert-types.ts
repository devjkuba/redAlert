import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultAlertTypes = [
  { label: "Zdravotní pomoc", icon: "HeartPulse", className: "from-red-500 to-pink-600", order: 1 },
  { label: "Požár", icon: "Flame", className: "from-orange-500 to-red-500", order: 2 },
  { label: "Vniknutí", icon: "DoorOpen", className: "from-indigo-600 to-indigo-700", order: 3 },
  { label: "Rvačka", icon: "FightIcon", className: "from-purple-500 to-purple-600", order: 4 },
  { label: "Evakuace", icon: "LogOut", className: "from-green-500 to-green-600", order: 5 },
  { label: "Vandalismus", icon: "SprayCan", className: "from-pink-500 to-pink-600", order: 6 },
  { label: "Výpadek proudu", icon: "PlugZap", className: "from-yellow-500 to-orange-700", order: 7 },
  { label: "Aktivní útočník", icon: "GunIcon", className: "from-gray-500 to-gray-900", order: 8 },
  { label: "Únik plynu", icon: "GasIcon", className: "from-yellow-500 to-lime-600", order: 9 },
];

async function main() {
  const orgs = await prisma.organization.findMany();

  for (const org of orgs) {
    const count = await prisma.alertType.count({
      where: { organizationId: org.id },
    });

    if (count === 0) {
      await prisma.alertType.createMany({
        data: defaultAlertTypes.map(a => ({
          ...a,
          organizationId: org.id,
        })),
      });
      console.log(`✅ Seeded alert types for organization #${org.id}`);
    } else {
      console.log(`ℹ️  Organization #${org.id} already has ${count} alert types, skipping`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
