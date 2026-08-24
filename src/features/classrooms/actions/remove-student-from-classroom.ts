'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function removeStudentFromClassroom(classroomId: string, studentId: string) {
  await requireRoleOrThrow(['admin']);

  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: { classroomId: null },
  });

  revalidatePath(`/dashboard/classrooms/${classroomId}`);

  return { success: true, message: 'Siswa berhasil dihapus dari kelas' };
}
