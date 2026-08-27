'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { munaqasyahScheduleSchema, type MunaqasyahScheduleSchema } from '../munaqasyah.schema';

export async function updateMunaqasyahSchedule(scheduleId: string, input: MunaqasyahScheduleSchema) {
  await requireRoleOrThrow(['coordinator']);

  const parsed = munaqasyahScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  const { requestIds, date, examinerId, ...rest } = parsed.data;

  const current = await prisma.munaqasyahScheduleRequest.findMany({
    where: { scheduleId },
    select: { requestId: true },
  });
  const currentIds = new Set(current.map((c) => c.requestId));
  const nextIds = new Set(requestIds);
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));
  const toAdd = [...nextIds].filter((id) => !currentIds.has(id));

  if (toRemove.length > 0) {
    const withResults = await prisma.munaqasyahResult.count({ where: { scheduleId, requestId: { in: toRemove } } });
    if (withResults > 0) {
      return { success: false, message: 'Tidak dapat menghapus peserta yang sudah memiliki hasil munaqasyah' };
    }
  }

  const validNewRequests =
    toAdd.length > 0
      ? await prisma.munaqasyahRequest.findMany({
          where: { id: { in: toAdd }, status: 'DITERIMA', scheduleRequests: { none: {} } },
          select: { id: true },
        })
      : [];

  try {
    await prisma.$transaction([
      prisma.munaqasyahSchedule.update({ where: { id: scheduleId }, data: { date: new Date(date), examinerId, ...rest } }),
      ...(toRemove.length > 0
        ? [prisma.munaqasyahScheduleRequest.deleteMany({ where: { scheduleId, requestId: { in: toRemove } } })]
        : []),
      ...(validNewRequests.length > 0
        ? [prisma.munaqasyahScheduleRequest.createMany({ data: validNewRequests.map((r) => ({ scheduleId, requestId: r.id })) })]
        : []),
    ]);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return { success: false, message: 'Jadwal dengan tanggal, sesi, waktu, dan lokasi tersebut sudah ada' };
    }
    console.error('Failed to update munaqasyah schedule:', error);
    return { success: false, message: 'Gagal memperbarui jadwal munaqasyah' };
  }

  revalidatePath('/dashboard/munaqasyah/schedules');
  return { success: true, message: 'Jadwal munaqasyah berhasil diperbarui' };
}
