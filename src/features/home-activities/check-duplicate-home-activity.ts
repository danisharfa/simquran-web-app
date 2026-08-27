import { prisma } from '@/lib/prisma';
import type { HomeActivitySchema } from './home-activity.schema';

interface CheckParams {
  studentId: string;
  data: HomeActivitySchema;
  excludeId?: string;
}

/** Prevents a student from logging the exact same home activity twice on the same day. */
export async function findDuplicateHomeActivityMessage({
  studentId,
  data,
  excludeId,
}: CheckParams): Promise<string | null> {
  const dayStart = new Date(data.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const duplicate = await prisma.homeActivity.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      studentId,
      activityType: data.activityType,
      surahId: data.surahId,
      startVerse: data.startVerse,
      endVerse: data.endVerse,
      date: { gte: dayStart, lte: dayEnd },
    },
    select: { id: true },
  });

  return duplicate ? 'Aktivitas ini sudah pernah diinput pada tanggal tersebut.' : null;
}
