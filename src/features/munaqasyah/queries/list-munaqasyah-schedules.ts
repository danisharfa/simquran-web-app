import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahScheduleTableData {
  id: string;
  date: Date;
  sessionName: string;
  startTime: string;
  endTime: string;
  location: string;
  examinerName: string | null;
  requestCount: number;
}

export async function listMunaqasyahSchedules(): Promise<MunaqasyahScheduleTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const schedules = await prisma.munaqasyahSchedule.findMany({
    include: { examiner: { include: { user: true } }, _count: { select: { scheduleRequests: true } } },
    orderBy: { date: 'desc' },
  });

  return schedules.map((s) => ({
    id: s.id,
    date: s.date,
    sessionName: s.sessionName,
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
    examinerName: s.examiner?.user.name ?? null,
    requestCount: s._count.scheduleRequests,
  }));
}
