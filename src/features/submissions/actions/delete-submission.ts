'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteSubmission(submissionId: string) {
  const session = await requireRoleOrThrow(['teacher']);

  const existing = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Setoran tidak ditemukan' };
  }

  await prisma.submission.delete({ where: { id: submissionId } });

  revalidatePath('/dashboard/submission/history');

  return { success: true, message: 'Setoran berhasil dihapus' };
}
