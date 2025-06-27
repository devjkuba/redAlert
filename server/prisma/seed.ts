import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultServices = [
  { label: 'Policie ČR', number: '158', icon: 'Shield', hasSms: true },
  { label: 'Městská policie', number: '156', icon: 'Shield', hasSms: true },
  { label: 'Zdravotnická záchranná služba', number: '155', icon: 'Ambulance', hasSms: false },
  { label: 'Tísňová linka', number: '112', icon: 'PhoneCall', hasSms: true },
  { label: 'Hasičský záchranný sbor ČR', number: '150', icon: 'Flame', hasSms: true },
];

async function main() {
  const orgs = await prisma.organization.findMany();

  for (const org of orgs) {
    const count = await prisma.emergencyService.count({
      where: { organizationId: org.id },
    });

    if (count === 0) {
      await prisma.emergencyService.createMany({
        data: defaultServices.map(s => ({
          ...s,
          organizationId: org.id,
        })),
      });
      console.log(`✅ Seeded emergency services for organization #${org.id}`);
    } else {
      console.log(`ℹ️  Organization #${org.id} already has ${count} services, skipping`);
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
