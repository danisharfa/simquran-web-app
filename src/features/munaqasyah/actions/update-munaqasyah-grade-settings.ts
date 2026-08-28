'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import {
  updateMunaqasyahGradeSettingsSchema,
  type UpdateMunaqasyahGradeSettingsSchema,
} from '../munaqasyah.schema';

export async function updateMunaqasyahGradeSettings(input: UpdateMunaqasyahGradeSettingsSchema) {
  const session = await requireRoleOrThrow(['superadmin']);

  const parsed = updateMunaqasyahGradeSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  await prisma.$transaction(
    parsed.data.settings.map((s) =>
      prisma.munaqasyahGradeSetting.update({
        where: { grade: s.grade },
        data: { minScore: s.minScore, label: s.label, updatedBy: session.user.id },
      }),
    ),
  );

  revalidatePath('/dashboard/scoring-settings');

  return { success: true, message: 'Batas lulus dan predikat berhasil disimpan' };
}
