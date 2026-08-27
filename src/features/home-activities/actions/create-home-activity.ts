'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { homeActivitySchema, type HomeActivitySchema } from '../home-activity.schema';
import { findDuplicateHomeActivityMessage } from '../check-duplicate-home-activity';

export async function createHomeActivity(input: HomeActivitySchema) {
  const session = await requireRoleOrThrow(['student']);

  const parsed = homeActivitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!student?.groupId) {
    return { success: false, message: 'Anda belum tergabung dalam kelompok' };
  }

  const duplicateMessage = await findDuplicateHomeActivityMessage({ studentId: session.user.id, data: parsed.data });
  if (duplicateMessage) {
    return { success: false, message: duplicateMessage };
  }

  const { date, ...rest } = parsed.data;

  await prisma.homeActivity.create({
    data: {
      id: randomUUID(),
      studentId: session.user.id,
      groupId: student.groupId,
      date: new Date(date),
      ...rest,
    },
  });

  revalidatePath('/dashboard/home-activity');

  return { success: true, message: 'Aktivitas rumah berhasil dicatat' };
}
