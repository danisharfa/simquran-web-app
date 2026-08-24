'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function removeStudentFromGroup(groupId: string, studentId: string) {
  await requireRoleOrThrow(['coordinator']);

  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: { groupId: null },
  });

  revalidatePath(`/dashboard/group/${groupId}`);

  return { success: true, message: 'Siswa berhasil dihapus dari kelompok' };
}
