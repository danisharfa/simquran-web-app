'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { finalScoreWeightsSchema, type FinalScoreWeightsSchema } from '../munaqasyah.schema';

export async function updateFinalScoreWeights(input: FinalScoreWeightsSchema) {
  const session = await requireRoleOrThrow(['superadmin']);

  const parsed = finalScoreWeightsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  await prisma.munaqasyahFinalScoreWeightSetting.update({
    where: { id: 'singleton' },
    data: { ...parsed.data, updatedBy: session.user.id },
  });

  revalidatePath('/dashboard/scoring-settings');
  revalidatePath('/dashboard/munaqasyah/assessment');
  revalidatePath('/dashboard/munaqasyah/results');
  revalidatePath('/dashboard/munaqasyah/result');

  return { success: true, message: 'Bobot nilai akhir berhasil disimpan' };
}
