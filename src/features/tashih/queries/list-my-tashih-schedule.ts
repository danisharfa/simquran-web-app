import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface MyTashihScheduleData {
  requestId: string;
  studentName: string;
  detail: string;
  date: Date;
  sessionName: string;
  startTime: string;
  endTime: string;
  location: string;
}

export async function listMyTashihSchedule(): Promise<MyTashihScheduleData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const entries = await prisma.tashihScheduleRequest.findMany({
    where: { request: { teacherId: session.user.id } },
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
