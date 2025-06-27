import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Barvy podle Tailwind CSS tříd v hex formátu
  const colorMap: Record<string, string> = {
    'Policie ČR': '#0ea5e9',              // text-sky-500
    'Městská policie': '#1e40af',         // text-blue-800
    'Zdravotnická záchranná služba': '#ef4444', // text-red-500
    'Tísňová linka': '#7c3aed',           // text-purple-600
    'Hasičský záchranný sbor ČR': '#eab308', // text-yellow-500
  };

  for (const [label, color] of Object.entries(colorMap)) {
    const updated = await prisma.emergencyService.updateMany({
      where: { label },
      data: { iconColor: color },
    });
    console.log(`Updated ${updated.count} rows for "${label}" with color ${color}`);
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
