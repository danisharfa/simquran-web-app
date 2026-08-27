'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tashihScheduleSchema, type TashihScheduleSchema } from '../tashih.schema';

export async function updateTashihSchedule(scheduleId: string, input: TashihScheduleSchema) {
  await requireRoleOrThrow(['coordinator']);

  const parsed = tashihScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  const { requestIds, date, ...rest } = parsed.data;

  const current = await prisma.tashihScheduleRequest.findMany({ where: { scheduleId }, select: { requestId: true } });
  const currentIds = new Set(current.map((c) => c.requestId));
  const nextIds = new Set(requestIds);
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));
  const toAdd = [...nextIds].filter((id) => !currentIds.has(id));

  if (toRemove.length > 0) {
    const withResults = await prisma.tashihResult.count({ where: { scheduleId, requestId: { in: toRemove } } });
    if (withResults > 0) {
      return { success: false, message: 'Tidak dapat menghapus peserta yang sudah memiliki hasil tashih' };
    }
  }

  const validNewRequests = toAdd.length > 0
    ? await prisma.tashihRequest.findMany({
        where: { id: { in: toAdd }, status: 'DITERIMA', scheduleRequests: { none: {} } },
        select: { id: true },
      })
    : [];

  try {
    await prisma.$transaction([
      prisma.tashihSchedule.update({ where: { id: scheduleId }, data: { date: new Date(date), ...rest } }),
      ...(toRemove.length > 0
        ? [prisma.tashihScheduleRequest.deleteMany({ where: { scheduleId, requestId: { in: toRemove } } })]
        : []),
      ...(validNewRequests.length > 0
        ? [prisma.tashihScheduleRequest.createMany({ data: validNewRequests.map((r) => ({ scheduleId, requestId: r.id })) })]
        : []),
    ]);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return { success: false, message: 'Jadwal dengan tanggal, sesi, waktu, dan lokasi tersebut sudah ada' };
    }
    console.error('Failed to update tashih schedule:', error);
    return { success: false, message: 'Gagal memperbarui jadwal tashih' };
  }

  revalidatePath('/dashboard/tashih/schedules');
  return { success: true, message: 'Jadwal tashih berhasil diperbarui' };
}
