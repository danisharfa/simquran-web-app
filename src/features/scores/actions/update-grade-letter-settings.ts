'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { updateGradeLetterSettingsSchema, type UpdateGradeLetterSettingsSchema } from '../score.schema';

export async function updateGradeLetterSettings(input: UpdateGradeLetterSettingsSchema) {
  const session = await requireRoleOrThrow(['superadmin']);

  const parsed = updateGradeLetterSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  await prisma.$transaction(
    parsed.data.settings.map((s) =>
      prisma.gradeLetterSetting.update({
        where: { grade: s.grade },
        data: { minScore: s.minScore, description: s.description, updatedBy: session.user.id },
      }),
    ),
  );

  revalidatePath('/dashboard/scoring-settings');

  return { success: true, message: 'Mapping huruf berhasil disimpan' };
}
