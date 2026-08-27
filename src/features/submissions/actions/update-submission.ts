'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { submissionSchema, type SubmissionSchema } from '../submission.schema';
import { findDuplicateSubmissionMessage } from '../check-duplicate-submission';
import { recalculateWeeklyTargetsForStudent } from '@/features/weekly-targets/recalculate-weekly-target-progress';

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
