'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { weeklyTargetFieldsSchema, type WeeklyTargetFields } from '../weekly-target.schema';

export async function updateWeeklyTarget(targetId: string, input: WeeklyTargetFields) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = weeklyTargetFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const existing = await prisma.weeklyTarget.findUnique({ where: { id: targetId } });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Target tidak ditemukan' };
  }

  const { groupId, startDate, endDate, ...rest } = parsed.data;

  await prisma.weeklyTarget.update({
    where: { id: targetId },
    data: { groupId, startDate: new Date(startDate), endDate: new Date(endDate), ...rest },
  });

  revalidatePath('/dashboard/weekly-target');

  return { success: true, message: 'Target mingguan berhasil diperbarui' };
}
