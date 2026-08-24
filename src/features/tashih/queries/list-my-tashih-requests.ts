import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface TashihRequestTableData {
  id: string;
  studentName: string;
  groupName: string;
  tashihType: string;
  detail: string;
  status: string;
  notes: string | null;
}

export async function listMyTashihRequests(): Promise<TashihRequestTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const requests = await prisma.tashihRequest.findMany({
    where: { teacherId: session.user.id },
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
