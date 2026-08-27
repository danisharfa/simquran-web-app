'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { recalculateWeeklyTargetsForStudent } from '@/features/weekly-targets/recalculate-weekly-target-progress';
import { getLockedSubmissionIds } from '../get-locked-submission-ids';
import { logSubmissionDeletion } from '../log-submission-deletion';

export async function deleteSubmission(submissionId: string) {
  const session = await requireRoleOrThrow(['teacher']);

  const existing = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { student: { include: { user: true } }, group: { include: { classroom: true } }, surah: true, wafa: true },
  });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Setoran tidak ditemukan' };
  }

  const lockedIds = await getLockedSubmissionIds(existing.studentId);
  if (lockedIds.has(submissionId)) {
    return {
      success: false,
      message:
        'Setoran ini sudah menjadi bagian dari pengajuan tashih yang sedang berjalan, sehingga tidak dapat dihapus.',
    };
  }

  await logSubmissionDeletion(existing, session.user.name);

  await prisma.submission.delete({ where: { id: submissionId } });

  await recalculateWeeklyTargetsForStudent(existing.studentId);

  revalidatePath('/dashboard/submission');
  revalidatePath('/dashboard/weekly-target');

  return { success: true, message: 'Setoran berhasil dihapus' };
}
