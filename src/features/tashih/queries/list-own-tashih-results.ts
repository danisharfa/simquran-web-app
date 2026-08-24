import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';
import type { TashihResultTableData } from './list-all-tashih-results';

export async function listOwnTashihResults(): Promise<TashihResultTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const results = await prisma.tashihResult.findMany({
    where: { request: { studentId: session.user.id } },
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
