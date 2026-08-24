'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';
import { headers } from 'next/headers';
import type { Gender, BloodType } from '@/lib/generated/prisma/enums';

export interface UpdateOwnProfileInput {
  name?: string;
  username?: string;
  email?: string | null;
  phoneNumber?: string | null;
  birthDate?: Date | null;
  birthPlace?: string | null;
  address?: string | null;
  gender?: Gender | null;
  bloodType?: BloodType | null;
}

export async function updateOwnProfile(input: UpdateOwnProfileInput) {
  const session = await requireSession();
  const userId = session.user.id;
  const role = session.user.role.toLowerCase();
  const isAdminOrSuperadmin = role === 'admin' || role === 'superadmin';

  // name and username can only be updated by admin/superadmin on their own profile
  if (isAdminOrSuperadmin) {
    const authData: Record<string, string> = {};
    if (input.name !== undefined) authData.name = input.name;
    if (input.username !== undefined) authData.username = input.username;

    if (Object.keys(authData).length > 0) {
      await auth.api.adminUpdateUser({
        body: { userId, data: authData },
        headers: await headers(),
      });
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: input.email,
      phoneNumber: input.phoneNumber,
      birthDate: input.birthDate,
      birthPlace: input.birthPlace,
      address: input.address,
      gender: input.gender,
      bloodType: input.bloodType,
    },
  });

  return { success: true };
}
