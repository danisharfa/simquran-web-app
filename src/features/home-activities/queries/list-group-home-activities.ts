import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { HomeActivityTableData } from './list-own-home-activities';

export async function listGroupHomeActivities(): Promise<HomeActivityTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const activities = await prisma.homeActivity.findMany({
    where: { group: { teacherId: session.user.id } },
    include: { student: { include: { user: true } }, group: { include: { classroom: true } }, surah: true },
    orderBy: { date: 'desc' },
  });

  return activities.map((a) => ({
    id: a.id,
    date: a.date,
    studentName: a.student.user.name,
    groupId: a.groupId,
    groupName: a.group.name,
    classroomId: a.group.classroomId,
    classroomName: `${a.group.classroom.level} ${a.group.classroom.name}`,
    academicYear: a.group.classroom.academicYear,
    semester: a.group.classroom.semester,
    activityType: a.activityType,
    detail: `${a.surah.name} ayat ${a.startVerse}-${a.endVerse}`,
    note: a.note,
  }));
}
