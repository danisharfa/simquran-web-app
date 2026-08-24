'use server';

import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';
import type { UserDetail } from './get-user-detail';

export async function getOwnProfile(): Promise<UserDetail> {
  const session = await requireSession();
  const userId = session.user.id;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      teacherProfiles: true,
      coordinatorProfiles: true,
      studentProfiles: true,
    },
  });

  return {
    id: user.id,
    role: user.role,
    name: user.name,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate,
    birthPlace: user.birthPlace,
    address: user.address,
    gender: user.gender,
    bloodType: user.bloodType,
    nip: user.teacherProfiles[0]?.nip ?? user.coordinatorProfiles[0]?.nip ?? null,
    nis: user.studentProfiles[0]?.nis ?? null,
    nisn: user.studentProfiles[0]?.nisn ?? null,
  };
}
