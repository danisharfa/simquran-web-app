'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { groupSchema } from '../group.schema';

export async function createGroup(formData: FormData) {
  await requireRoleOrThrow(['coordinator']);

  const parsed = groupSchema.safeParse({
    name: formData.get('name'),
    classroomId: formData.get('classroomId'),
    teacherId: formData.get('teacherId'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
    };
  }

  const { name, classroomId, teacherId } = parsed.data;

  try {
    await prisma.group.create({
      data: {
        id: randomUUID(),
        name,
        classroomId,
        teacherId,
      },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return {
        success: false,
        error: 'Kelompok dengan nama tersebut sudah ada di kelas ini',
      };
    }

    console.error('Failed to create group:', error);
    return { success: false, error: 'Gagal membuat kelompok' };
  }

  revalidatePath('/dashboard/group');

  return { success: true };
}
