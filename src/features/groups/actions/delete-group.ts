'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteGroup(groupId: string) {
  await requireRoleOrThrow(['coordinator']);

  try {
    await prisma.group.delete({ where: { id: groupId } });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error.code === 'P2003' || error.code === 'P2014')
    ) {
      return {
        success: false,
        message: 'Kelompok tidak dapat dihapus karena masih memiliki data terkait',
      };
    }

    console.error('Failed to delete group:', error);
    return { success: false, message: 'Gagal menghapus kelompok' };
  }

  revalidatePath('/dashboard/group');

  return { success: true, message: 'Kelompok berhasil dihapus' };
}
