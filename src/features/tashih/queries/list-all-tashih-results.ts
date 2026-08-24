import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface TashihResultTableData {
  id: string;
  studentName: string;
  detail: string;
  scheduleDate: Date;
  passed: boolean;
  notes: string | null;
}

export async function listAllTashihResults(): Promise<TashihResultTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const results = await prisma.tashihResult.findMany({
    include: {
      schedule: true,
      request: { include: { student: { include: { user: true } }, juz: true, surah: true, wafa: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    id: r.id,
    studentName: r.request.student.user.name,
    detail: formatTashihDetail(r.request),
    scheduleDate: r.schedule.date,
    passed: r.passed,
    notes: r.notes,
  }));
}
