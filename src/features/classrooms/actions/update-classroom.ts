'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { classroomNameSchema } from '../classroom.schema';

export async function updateClassroomName(classroomId: string, name: string) {
  await requireRoleOrThrow(['admin']);

  const parsed = classroomNameSchema.safeParse({ name });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
    };
  }

  try {
    await prisma.classroom.update({
      where: { id: classroomId },
      data: { name: parsed.data.name },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return {
        success: false,
        error: 'Kelas dengan nama, tahun ajaran, dan semester tersebut sudah ada',
      };
    }

    console.error('Failed to update classroom:', error);
    return { success: false, error: 'Gagal memperbarui nama kelas' };
  }

  revalidatePath('/dashboard/classrooms');
  revalidatePath(`/dashboard/classrooms/${classroomId}`);

  return { success: true };
}
