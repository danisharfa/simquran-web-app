'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteTashihSchedule(scheduleId: string) {
  await requireRoleOrThrow(['coordinator']);

  const resultCount = await prisma.tashihResult.count({ where: { scheduleId } });
  if (resultCount > 0) {
    return { success: false, message: 'Jadwal ini sudah memiliki hasil, tidak bisa dihapus' };
  }

  await prisma.tashihSchedule.delete({ where: { id: scheduleId } });

  revalidatePath('/dashboard/tashih/schedules');

  return { success: true, message: 'Jadwal tashih berhasil dihapus' };
}
