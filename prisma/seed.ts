import { prisma } from '../src/lib/prisma';
import { auth } from '../src/lib/auth';
import { Role } from '@/lib/generated/prisma/enums';

async function main() {
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
