import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';
import { Role } from '@/generated/prisma/enums';

async function main() {
  const username = 'admin';
  const password = 'admin';
  const hashedPassword = await hash(password, 10);

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName: 'admin',
        role: Role.Admin,
      },
    });

    console.log(`User created: ${username}/${password}`);
  } else {
    console.log(`User already exists: ${username}`);
  }
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
