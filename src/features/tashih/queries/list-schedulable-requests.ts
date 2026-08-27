import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface SchedulableRequestOption {
  id: string;
  studentName: string;
  detail: string;
}

export async function listSchedulableRequests(): Promise<SchedulableRequestOption[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.tashihRequest.findMany({
    where: { status: 'DITERIMA', scheduleRequests: { none: {} } },
    include: { student: { include: { user: true } }, juz: true, surah: true, wafa: true },
    orderBy: { createdAt: 'asc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    detail: formatTashihDetail(r),
  }));
}

export async function listSchedulableRequestsForEdit(scheduleId: string): Promise<SchedulableRequestOption[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.tashihRequest.findMany({
    where: {
      status: 'DITERIMA',
      OR: [{ scheduleRequests: { none: {} } }, { scheduleRequests: { some: { scheduleId } } }],
    },
    include: { student: { include: { user: true } }, juz: true, surah: true, wafa: true },
    orderBy: { createdAt: 'asc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    detail: formatTashihDetail(r),
  }));
}
