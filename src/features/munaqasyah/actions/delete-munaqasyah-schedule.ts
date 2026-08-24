'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteMunaqasyahSchedule(scheduleId: string) {
  await requireRoleOrThrow(['coordinator']);

  const resultCount = await prisma.munaqasyahResult.count({ where: { scheduleId } });
  if (resultCount > 0) {
    return { success: false, message: 'Jadwal ini sudah memiliki hasil, tidak bisa dihapus' };
  }

  await prisma.munaqasyahSchedule.delete({ where: { id: scheduleId } });

  revalidatePath('/dashboard/munaqasyah/schedules');

  return { success: true, message: 'Jadwal munaqasyah berhasil dihapus' };
}
