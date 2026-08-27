'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteClassroom(classroomId: string) {
  await requireRoleOrThrow(['admin']);

  try {
    await prisma.classroom.delete({ where: { id: classroomId } });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error.code === 'P2003' || error.code === 'P2014')
    ) {
      return {
        success: false,
        message: 'Kelas tidak dapat dihapus karena masih memiliki siswa atau kelompok terdaftar',
      };
    }

    console.error('Failed to delete classroom:', error);
    return { success: false, message: 'Gagal menghapus kelas' };
  }

  revalidatePath('/dashboard/classrooms');

  return { success: true, message: 'Kelas berhasil dihapus' };
}
