'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { munaqasyahScheduleSchema, type MunaqasyahScheduleSchema } from '../munaqasyah.schema';

export async function createMunaqasyahSchedule(input: MunaqasyahScheduleSchema) {
  const session = await requireRoleOrThrow(['coordinator']);

  const parsed = munaqasyahScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { requestIds, date, examinerId, ...rest } = parsed.data;

  const validRequests = await prisma.munaqasyahRequest.findMany({
    where: { id: { in: requestIds }, status: 'DITERIMA', scheduleRequests: { none: {} } },
    select: { id: true },
  });

  if (validRequests.length === 0) {
    return { success: false, message: 'Tidak ada permintaan valid untuk dijadwalkan' };
  }

  const scheduleId = randomUUID();

  try {
    await prisma.munaqasyahSchedule.create({
      data: {
        id: scheduleId,
        coordinatorId: session.user.id,
        date: new Date(date),
        examinerId,
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

    console.error('Failed to create munaqasyah schedule:', error);
    return { success: false, message: 'Gagal membuat jadwal munaqasyah' };
  }

  revalidatePath('/dashboard/munaqasyah/schedules');

  return { success: true, message: 'Jadwal munaqasyah berhasil dibuat' };
}
