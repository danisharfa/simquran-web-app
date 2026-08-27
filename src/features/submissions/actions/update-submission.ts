'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { submissionSchema, type SubmissionSchema } from '../submission.schema';
import { findDuplicateSubmissionMessage } from '../check-duplicate-submission';
import { recalculateWeeklyTargetsForStudent } from '@/features/weekly-targets/recalculate-weekly-target-progress';
import { getLockedSubmissionIds } from '../get-locked-submission-ids';

export async function updateSubmission(submissionId: string, input: SubmissionSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const existing = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Setoran tidak ditemukan' };
  }

  const { studentId, groupId, date, submissionStatus: _submissionStatus, ...rest } = parsed.data;

  const lockedIds = await getLockedSubmissionIds(existing.studentId);
  if (lockedIds.has(submissionId)) {
    const changedRestrictedField =
      studentId !== existing.studentId ||
      groupId !== existing.groupId ||
      new Date(date).getTime() !== existing.date.getTime() ||
      rest.submissionType !== existing.submissionType ||
      rest.juzId !== existing.juzId ||
      rest.surahId !== existing.surahId ||
      rest.startVerse !== existing.startVerse ||
      rest.endVerse !== existing.endVerse ||
      rest.wafaId !== existing.wafaId ||
      rest.startPage !== existing.startPage ||
      rest.endPage !== existing.endPage ||
      rest.adab !== existing.adab;

    if (changedRestrictedField) {
      return {
        success: false,
        message:
          'Setoran ini sudah menjadi bagian dari pengajuan tashih yang sedang berjalan. Hanya catatan yang dapat diubah.',
      };
    }

    await prisma.submission.update({ where: { id: submissionId }, data: { note: rest.note } });

    revalidatePath('/dashboard/submission');

    return { success: true, message: 'Catatan setoran berhasil diperbarui' };
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  const duplicateMessage = await findDuplicateSubmissionMessage({
    studentId,
    data: parsed.data,
    excludeId: submissionId,
  });
  if (duplicateMessage) {
    return { success: false, message: duplicateMessage };
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { studentId, groupId, date: new Date(date), ...rest, submissionStatus: existing.submissionStatus },
  });

  await recalculateWeeklyTargetsForStudent(studentId);
  if (existing.studentId !== studentId) {
    await recalculateWeeklyTargetsForStudent(existing.studentId);
  }

  revalidatePath('/dashboard/submission');
  revalidatePath('/dashboard/weekly-target');

  return { success: true, message: 'Setoran berhasil diperbarui' };
}
