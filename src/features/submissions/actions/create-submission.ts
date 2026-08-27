'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { submissionSchema, type SubmissionSchema } from '../submission.schema';
import { findDuplicateSubmissionMessage } from '../check-duplicate-submission';
import { recalculateWeeklyTargetsForStudent } from '@/features/weekly-targets/recalculate-weekly-target-progress';

export async function createSubmission(input: SubmissionSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { studentId, groupId, date, ...rest } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  const duplicateMessage = await findDuplicateSubmissionMessage({ studentId, data: parsed.data });
  if (duplicateMessage) {
    return { success: false, message: duplicateMessage };
  }

  await prisma.submission.create({
    data: {
      id: randomUUID(),
      studentId,
      groupId,
      teacherId: session.user.id,
      date: new Date(date),
      ...rest,
    },
  });

  await recalculateWeeklyTargetsForStudent(studentId);

  revalidatePath('/dashboard/submission');
  revalidatePath('/dashboard/weekly-target');

  return { success: true, message: 'Setoran berhasil dicatat' };
}
