import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';
import type { TashihRequestTableData } from './list-my-tashih-requests';

export async function listAllTashihRequests(): Promise<TashihRequestTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.tashihRequest.findMany({
    include: { student: { include: { user: true } }, group: true, juz: true, surah: true, wafa: true },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    groupName: r.group.name,
    tashihType: r.tashihType,
    detail: formatTashihDetail(r),
    status: r.status,
    notes: r.notes,
  }));
}
