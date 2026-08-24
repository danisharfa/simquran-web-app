'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { SchoolInfoSchema } from '../academic-settings.schema';

export async function updateSchoolInfo(data: SchoolInfoSchema) {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);

  await prisma.academicSetting.upsert({
    where: { id: 'singleton' },
    update: {
      schoolName: data.schoolName,
      schoolAddress: data.schoolAddress,
      currentPrincipalName: data.currentPrincipalName,
      updatedBy: session.user.id,
    },
    create: {
      id: 'singleton',
      currentYear: '',
      currentSemester: 'GANJIL',
      currentPrincipalName: data.currentPrincipalName,
      schoolName: data.schoolName,
      schoolAddress: data.schoolAddress,
      updatedBy: session.user.id,
    },
  });

  revalidatePath('/dashboard/academic-settings');

  return { success: true };
}
