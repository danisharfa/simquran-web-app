import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface HomeActivityTableData {
  id: string;
  date: Date;
  studentName: string;
  groupName: string;
  activityType: string;
  detail: string;
  note: string | null;
}

export async function listOwnHomeActivities(): Promise<HomeActivityTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const activities = await prisma.homeActivity.findMany({
    where: { studentId: session.user.id },
    include: { student: { include: { user: true } }, group: true, surah: true },
    orderBy: { date: 'desc' },
  });

  return activities.map((a) => ({
    id: a.id,
    date: a.date,
    studentName: a.student.user.name,
    groupName: a.group.name,
    activityType: a.activityType,
    detail: `${a.surah.name} ayat ${a.startVerse}-${a.endVerse}`,
    note: a.note,
  }));
}
