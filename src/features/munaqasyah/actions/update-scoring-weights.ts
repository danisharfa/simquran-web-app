'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { scoringWeightsSchema, type ScoringWeightsSchema } from '../munaqasyah.schema';
import type { MunaqasyahJenisUjian } from '@/lib/generated/prisma/enums';

export async function updateScoringWeights(jenis: MunaqasyahJenisUjian, input: ScoringWeightsSchema) {
  const session = await requireRoleOrThrow(['superadmin']);

  const parsed = scoringWeightsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  await prisma.munaqasyahScoringSetting.update({
    where: { jenis },
    data: { ...parsed.data, updatedBy: session.user.id },
  });

  revalidatePath('/dashboard/scoring-settings');

  return { success: true, message: 'Bobot pengurangan berhasil disimpan' };
}
