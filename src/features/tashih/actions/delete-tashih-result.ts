'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteTashihResult(resultId: string) {
  await requireRoleOrThrow(['coordinator']);

  const result = await prisma.tashihResult.findUnique({ where: { id: resultId } });
  if (!result) {
    return { success: false, message: 'Hasil tidak ditemukan' };
  }

  await prisma.$transaction([
    prisma.tashihResult.delete({ where: { id: resultId } }),
    prisma.tashihRequest.update({ where: { id: result.requestId }, data: { status: 'DITERIMA' } }),
  ]);

  revalidatePath('/dashboard/tashih/results');

  return { success: true, message: 'Hasil tashih berhasil dihapus' };
}
