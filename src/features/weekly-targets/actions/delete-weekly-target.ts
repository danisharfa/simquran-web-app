'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteWeeklyTarget(targetId: string) {
  const session = await requireRoleOrThrow(['teacher']);

  const existing = await prisma.weeklyTarget.findUnique({ where: { id: targetId } });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Target tidak ditemukan' };
  }

  await prisma.weeklyTarget.delete({ where: { id: targetId } });

  revalidatePath('/dashboard/weekly-target');

  return { success: true, message: 'Target mingguan berhasil dihapus' };
}
