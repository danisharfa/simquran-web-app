'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function assignStudentsToGroup(groupId: string, studentIds: string[]) {
  await requireRoleOrThrow(['coordinator']);

  if (studentIds.length === 0) {
    return { success: false, message: 'Pilih minimal satu siswa' };
  }

  const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId } });

  await prisma.studentProfile.updateMany({
    where: { userId: { in: studentIds }, classroomId: group.classroomId, groupId: null },
    data: { groupId },
  });

  revalidatePath(`/dashboard/group/${groupId}`);

  return { success: true, message: 'Siswa berhasil ditambahkan ke kelompok' };
}
