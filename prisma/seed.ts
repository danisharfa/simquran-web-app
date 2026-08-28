import { prisma } from '../src/lib/prisma';
import { auth } from '../src/lib/auth';
import { Role, Semester } from '@/lib/generated/prisma/enums';
import surahData from './data/surah.json';
import juzData from './data/juz.json';
import surahJuzData from './data/surah_juz.json';
import wafaData from './data/wafa.json';
import academicSettingData from './data/academic_setting.json';

async function seedQuranReferenceData() {
  await prisma.surah.createMany({ data: surahData, skipDuplicates: true });
  await prisma.juz.createMany({ data: juzData, skipDuplicates: true });
  await prisma.surahJuz.createMany({ data: surahJuzData, skipDuplicates: true });
  await prisma.wafa.createMany({ data: wafaData, skipDuplicates: true });

  console.log('Quran reference data seeded');
}

async function seedAcademicSetting() {
  // Table is a singleton — app actions always read/write id "singleton", so seeding
  // must target the same id regardless of what id the source data export used.
  const [{ currentYear, currentSemester, currentPrincipalName, schoolName, schoolAddress }] = academicSettingData;

  await prisma.academicSetting.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      currentYear,
      currentSemester: currentSemester as Semester,
      currentPrincipalName,
      schoolName,
      schoolAddress,
    },
  });

  console.log('Academic setting seeded');
}

async function main() {
  await seedQuranReferenceData();
  await seedAcademicSetting();

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
