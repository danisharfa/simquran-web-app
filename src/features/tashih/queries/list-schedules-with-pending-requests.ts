import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface ScheduleWithPendingRequests {
  id: string;
  label: string;
  requests: { requestId: string; studentName: string; detail: string }[];
}

export async function listSchedulesWithPendingRequests(): Promise<ScheduleWithPendingRequests[]> {
  await requireRoleOrThrow(['coordinator']);

  const schedules = await prisma.tashihSchedule.findMany({
    include: {
      scheduleRequests: {
        where: { request: { result: null } },
        include: {
          request: { include: { student: { include: { user: true } }, juz: true, surah: true, wafa: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return schedules
    .filter((s) => s.scheduleRequests.length > 0)
    .map((s) => ({
      id: s.id,
      label: `${s.date.toLocaleDateString('id-ID')} - ${s.sessionName} (${s.location})`,
      requests: s.scheduleRequests.map((sr) => ({
        requestId: sr.requestId,
        studentName: sr.request.student.user.name,
        detail: formatTashihDetail(sr.request),
      })),
    }));
}
