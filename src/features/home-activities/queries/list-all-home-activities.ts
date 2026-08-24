import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { HomeActivityTableData } from './list-own-home-activities';

export async function listAllHomeActivities(): Promise<HomeActivityTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const activities = await prisma.homeActivity.findMany({
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
