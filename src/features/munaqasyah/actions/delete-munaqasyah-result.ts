'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteMunaqasyahResult(resultId: string) {
  await requireRoleOrThrow(['coordinator']);

  const result = await prisma.munaqasyahResult.findUnique({ where: { id: resultId }, include: { request: true } });
  if (!result || result.request.jenis !== 'MUNAQASYAH') {
    return { success: false, message: 'Hasil Munaqasyah tidak ditemukan' };
  }

  await prisma.$transaction([
    prisma.munaqasyahFinalResult.deleteMany({
      where: { OR: [{ tasmiResultId: resultId }, { munaqasyahResultId: resultId }] },
    }),
    prisma.munaqasyahResult.delete({ where: { id: resultId } }),
    prisma.munaqasyahRequest.update({ where: { id: result.requestId }, data: { status: 'DITERIMA' } }),
  ]);

  revalidatePath('/dashboard/munaqasyah/assessment');
  revalidatePath('/dashboard/munaqasyah/results');

  return { success: true, message: 'Hasil Munaqasyah berhasil dihapus' };
}
