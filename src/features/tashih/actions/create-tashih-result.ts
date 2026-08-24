'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function createTashihResult(requestId: string, passed: boolean, notes: string | null) {
  const session = await requireRoleOrThrow(['coordinator']);

  const scheduleRequest = await prisma.tashihScheduleRequest.findFirst({ where: { requestId } });
  if (!scheduleRequest) {
    return { success: false, message: 'Permintaan ini belum dijadwalkan' };
  }

  const existing = await prisma.tashihResult.findUnique({ where: { requestId } });
  if (existing) {
    return { success: false, message: 'Hasil untuk permintaan ini sudah ada' };
  }

  await prisma.$transaction([
    prisma.tashihResult.create({
      data: {
        id: randomUUID(),
        coordinatorId: session.user.id,
        scheduleId: scheduleRequest.scheduleId,
        requestId,
        passed,
        notes,
      },
    }),
    prisma.tashihRequest.update({ where: { id: requestId }, data: { status: 'SELESAI' } }),
  ]);

  revalidatePath('/dashboard/tashih/results');

  return { success: true, message: 'Hasil tashih berhasil disimpan' };
}
