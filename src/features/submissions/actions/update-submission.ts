'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { submissionSchema, type SubmissionSchema } from '../submission.schema';

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

  const { studentId, groupId, date, ...rest } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { studentId, groupId, date: new Date(date), ...rest },
  });

  revalidatePath('/dashboard/submission/history');

  return { success: true, message: 'Setoran berhasil diperbarui' };
}
