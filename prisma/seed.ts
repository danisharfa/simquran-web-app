import { prisma } from '../src/lib/prisma';
import { auth } from '../src/lib/auth';
import { Role } from '@/lib/generated/prisma/enums';
import surahData from './data/surah.json';
import juzData from './data/juz.json';
import surahJuzData from './data/surah_juz.json';
import wafaData from './data/wafa.json';

async function seedQuranReferenceData() {
  await prisma.surah.createMany({ data: surahData, skipDuplicates: true });
  await prisma.juz.createMany({ data: juzData, skipDuplicates: true });
  await prisma.surahJuz.createMany({ data: surahJuzData, skipDuplicates: true });
  await prisma.wafa.createMany({ data: wafaData, skipDuplicates: true });

  console.log('Quran reference data seeded');
}

async function main() {
  await seedQuranReferenceData();

  const username = 'superadmin';

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    console.log(`User already exists: ${username}`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      name: 'Super Admin',
      email: 'superadmin@local.test',
      username: 'superadmin',
      password: 'superAdmin2026!',
    },
  });

  await prisma.user.update({
    where: {
      username: 'superadmin',
    },
    data: {
      role: Role.SUPERADMIN,
    },
  });

  console.log('Super Admin created');
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
