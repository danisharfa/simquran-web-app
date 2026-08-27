'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { homeActivitySchema, type HomeActivitySchema } from '../home-activity.schema';
import { findDuplicateHomeActivityMessage } from '../check-duplicate-home-activity';

export async function updateHomeActivity(activityId: string, input: HomeActivitySchema) {
  const session = await requireRoleOrThrow(['student']);

  const parsed = homeActivitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const existing = await prisma.homeActivity.findUnique({ where: { id: activityId } });
  if (!existing || existing.studentId !== session.user.id) {
    return { success: false, message: 'Aktivitas tidak ditemukan' };
  }
  if (existing.status === 'SUDAH_DIPERIKSA') {
    return { success: false, message: 'Aktivitas yang sudah diperiksa tidak dapat diubah' };
  }

  const duplicateMessage = await findDuplicateHomeActivityMessage({
    studentId: session.user.id,
    data: parsed.data,
    excludeId: activityId,
  });
  if (duplicateMessage) {
    return { success: false, message: duplicateMessage };
  }

  const { date, ...rest } = parsed.data;

  await prisma.homeActivity.update({
    where: { id: activityId },
    data: { date: new Date(date), ...rest },
  });

  revalidatePath('/dashboard/home-activity');

  return { success: true, message: 'Aktivitas rumah berhasil diperbarui' };
}
