'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { recalculateReport } from '../recalculate-report';

export async function deleteTahfidzScore(scoreId: string) {
  const session = await requireRoleOrThrow(['teacher']);

  const score = await prisma.tahfidzScore.findUnique({ where: { id: scoreId } });
  if (!score) {
    return { success: false, message: 'Nilai tidak ditemukan' };
  }

  const group = await prisma.group.findUnique({ where: { id: score.groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Tidak memiliki akses ke nilai ini' };
  }

  await prisma.tahfidzScore.delete({ where: { id: scoreId } });
  await recalculateReport(score.studentId, score.groupId);

  revalidatePath(`/dashboard/group/${score.groupId}/student/${score.studentId}/score`);
  revalidatePath(`/dashboard/group/${score.groupId}/student/${score.studentId}/report`);

  return { success: true, message: 'Nilai tahfidz berhasil dihapus' };
}
