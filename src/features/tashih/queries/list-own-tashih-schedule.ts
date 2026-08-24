import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';
import type { MyTashihScheduleData } from './list-my-tashih-schedule';

export async function listOwnTashihSchedule(): Promise<MyTashihScheduleData[]> {
  const session = await requireRoleOrThrow(['student']);

  const entries = await prisma.tashihScheduleRequest.findMany({
    where: { request: { studentId: session.user.id } },
    include: {
      schedule: true,
      request: { include: { student: { include: { user: true } }, juz: true, surah: true, wafa: true } },
    },
    orderBy: { schedule: { date: 'desc' } },
  });

  return entries.map((e) => ({
    requestId: e.requestId,
    studentName: e.request.student.user.name,
    detail: formatTashihDetail(e.request),
    date: e.schedule.date,
    sessionName: e.schedule.sessionName,
    startTime: e.schedule.startTime,
    endTime: e.schedule.endTime,
    location: e.schedule.location,
  }));
}
