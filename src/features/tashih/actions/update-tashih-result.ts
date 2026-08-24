'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function updateTashihResult(resultId: string, passed: boolean, notes: string | null) {
  await requireRoleOrThrow(['coordinator']);

  await prisma.tashihResult.update({ where: { id: resultId }, data: { passed, notes } });

  revalidatePath('/dashboard/tashih/results');

  return { success: true, message: 'Hasil tashih berhasil diperbarui' };
}
