'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { AcademicYearSchema } from '../academic-settings.schema';
import type { Semester } from '@/lib/generated/prisma/enums';

export async function updateAcademicYear(data: AcademicYearSchema) {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);

  await prisma.academicSetting.upsert({
    where: { id: 'singleton' },
    update: {
      currentYear: data.currentYear,
      currentSemester: data.currentSemester as Semester,
      updatedBy: session.user.id,
    },
    create: {
      id: 'singleton',
      currentYear: data.currentYear,
      currentSemester: data.currentSemester as Semester,
      currentPrincipalName: '',
      schoolName: '',
      schoolAddress: '',
      updatedBy: session.user.id,
    },
  });

  return { success: true };
}
