import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface TashihScheduleTableData {
  id: string;
  date: Date;
  sessionName: string;
  startTime: string;
  endTime: string;
  location: string;
  requestCount: number;
}

export async function listTashihSchedules(): Promise<TashihScheduleTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const schedules = await prisma.tashihSchedule.findMany({
    include: { _count: { select: { scheduleRequests: true } } },
    orderBy: { date: 'desc' },
  });

  return schedules.map((s) => ({
    id: s.id,
    date: s.date,
    sessionName: s.sessionName,
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
    requestCount: s._count.scheduleRequests,
  }));
}
