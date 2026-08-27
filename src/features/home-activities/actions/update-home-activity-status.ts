'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function updateHomeActivityStatus(activityId: string, status: 'BELUM_DIPERIKSA' | 'SUDAH_DIPERIKSA') {
  const session = await requireRoleOrThrow(['teacher']);

  const existing = await prisma.homeActivity.findUnique({
    where: { id: activityId },
    include: { group: true },
  });
  if (!existing || existing.group.teacherId !== session.user.id) {
    return { success: false, message: 'Aktivitas tidak ditemukan' };
  }

  await prisma.homeActivity.update({ where: { id: activityId }, data: { status } });

  revalidatePath('/dashboard/home-activity');

  return { success: true, message: 'Status aktivitas berhasil diperbarui' };
}
