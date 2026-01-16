// prisma/seed.ts
import { prisma } from './client';

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.branch.upsert({
    where: { code: 'DOUALA' },
    update: {},
    create: { code: 'DOUALA', name: 'INTIA - Douala' },
  });

  await prisma.branch.upsert({
    where: { code: 'YAOUNDE' },
    update: {},
    create: { code: 'YAOUNDE', name: 'INTIA - Yaounde' },
  });

  await prisma.branch.upsert({
    where: { code: 'DG' },
    update: {},
    create: { code: 'DG', name: 'Direction Générale' },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
