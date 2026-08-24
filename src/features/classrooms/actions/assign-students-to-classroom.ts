'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function assignStudentsToClassroom(classroomId: string, studentIds: string[]) {
  await requireRoleOrThrow(['admin']);

  if (studentIds.length === 0) {
    return { success: false, message: 'Pilih minimal satu siswa' };
  }

  await prisma.studentProfile.updateMany({
    where: { userId: { in: studentIds }, classroomId: null },
    data: { classroomId },
  });

  revalidatePath(`/dashboard/classrooms/${classroomId}`);

  return { success: true, message: 'Siswa berhasil ditambahkan ke kelas' };
}
