'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { updateSurahInitialScoresSchema, type UpdateSurahInitialScoresSchema } from '../munaqasyah.schema';

export async function updateSurahInitialScores(input: UpdateSurahInitialScoresSchema) {
  await requireRoleOrThrow(['superadmin']);

  const parsed = updateSurahInitialScoresSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  await prisma.$transaction(
    parsed.data.scores.map((s) =>
      prisma.surah.update({ where: { id: s.surahId }, data: { initialScore: s.initialScore } }),
    ),
  );

  revalidatePath('/dashboard/scoring-settings');

  return { success: true, message: 'Nilai awal surah berhasil disimpan' };
}
