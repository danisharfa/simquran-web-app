'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteHomeActivity(activityId: string) {
  const session = await requireRoleOrThrow(['student']);

  const existing = await prisma.homeActivity.findUnique({ where: { id: activityId } });
  if (!existing || existing.studentId !== session.user.id) {
    return { success: false, message: 'Aktivitas tidak ditemukan' };
  }
  if (existing.status === 'SUDAH_DIPERIKSA') {
    return { success: false, message: 'Aktivitas yang sudah diperiksa tidak dapat dihapus' };
  }

  await prisma.homeActivity.delete({ where: { id: activityId } });

  revalidatePath('/dashboard/home-activity');

  return { success: true, message: 'Aktivitas rumah berhasil dihapus' };
}
