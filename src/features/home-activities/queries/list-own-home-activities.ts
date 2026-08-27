import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface HomeActivityTableData {
  id: string;
  date: Date;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
  activityType: string;
  detail: string;
  note: string | null;
}

export async function listOwnHomeActivities(): Promise<HomeActivityTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const activities = await prisma.homeActivity.findMany({
    where: { studentId: session.user.id },
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
