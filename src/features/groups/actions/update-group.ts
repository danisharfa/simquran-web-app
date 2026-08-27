'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { groupNameSchema } from '../group.schema';

export async function updateGroupName(groupId: string, name: string) {
  await requireRoleOrThrow(['coordinator']);

  const parsed = groupNameSchema.safeParse({ name });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
    };
  }

  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { name: parsed.data.name },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return {
        success: false,
        error: 'Kelompok dengan nama tersebut sudah ada di kelas ini',
      };
    }

    console.error('Failed to update group:', error);
    return { success: false, error: 'Gagal memperbarui nama kelompok' };
  }

  revalidatePath('/dashboard/group');
  revalidatePath(`/dashboard/group/${groupId}`);

  return { success: true };
}
