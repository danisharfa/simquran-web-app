'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { assertTasmiResultEditable, findActiveMunaqasyahFollowUp } from '../munaqasyah-follow-up';

export async function deleteTasmiResult(resultId: string) {
  await requireRoleOrThrow(['coordinator']);

  const result = await prisma.munaqasyahResult.findUnique({ where: { id: resultId }, include: { request: true } });
  if (!result || result.request.jenis !== 'TASMI') {
    return { success: false, message: 'Hasil Tasmi tidak ditemukan' };
  }
  const { request } = result;

  const followUp = await findActiveMunaqasyahFollowUp(request.studentId, request.juzId);
  const blockedMessage = assertTasmiResultEditable(followUp);
  if (blockedMessage) {
    return { success: false, message: blockedMessage };
  }

  await prisma.$transaction([
    prisma.munaqasyahFinalResult.deleteMany({
      where: { OR: [{ tasmiResultId: resultId }, { munaqasyahResultId: resultId }] },
    }),
    prisma.munaqasyahResult.delete({ where: { id: resultId } }),
    prisma.munaqasyahRequest.update({ where: { id: request.id }, data: { status: 'DITERIMA' } }),
    ...(followUp && followUp.status === 'MENUNGGU'
      ? [prisma.munaqasyahRequest.delete({ where: { id: followUp.id } })]
      : []),
  ]);

  revalidatePath('/dashboard/munaqasyah/assessment');
  revalidatePath('/dashboard/munaqasyah/results');

  return { success: true, message: 'Hasil Tasmi berhasil dihapus' };
}
