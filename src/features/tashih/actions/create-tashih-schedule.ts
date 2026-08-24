'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tashihScheduleSchema, type TashihScheduleSchema } from '../tashih.schema';

export async function createTashihSchedule(input: TashihScheduleSchema) {
  const session = await requireRoleOrThrow(['coordinator']);

  const parsed = tashihScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { requestIds, date, ...rest } = parsed.data;

  const validRequests = await prisma.tashihRequest.findMany({
    where: { id: { in: requestIds }, status: 'DITERIMA', scheduleRequests: { none: {} } },
    select: { id: true },
  });

  if (validRequests.length === 0) {
    return { success: false, message: 'Tidak ada permintaan valid untuk dijadwalkan' };
  }

  const scheduleId = randomUUID();

  try {
    await prisma.tashihSchedule.create({
      data: {
        id: scheduleId,
        coordinatorId: session.user.id,
        date: new Date(date),
        ...rest,
        scheduleRequests: {
          createMany: { data: validRequests.map((r) => ({ requestId: r.id })) },
        },
      },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return { success: false, message: 'Jadwal dengan tanggal, sesi, waktu, dan lokasi tersebut sudah ada' };
    }

    console.error('Failed to create tashih schedule:', error);
    return { success: false, message: 'Gagal membuat jadwal tashih' };
  }

  revalidatePath('/dashboard/tashih/schedules');

  return { success: true, message: 'Jadwal tashih berhasil dibuat' };
}
