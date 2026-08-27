import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { WeeklyTargetTableData } from './list-my-weekly-targets';

export async function listOwnWeeklyTargets(): Promise<WeeklyTargetTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const targets = await prisma.weeklyTarget.findMany({
    where: { studentId: session.user.id },
    include: { student: { include: { user: true } }, group: { include: { classroom: true } } },
    orderBy: { startDate: 'desc' },
  });

  return targets.map((t) => ({
    id: t.id,
    studentName: t.student.user.name,
    groupId: t.groupId,
    groupName: t.group.name,
    classroomId: t.group.classroomId,
    classroomName: `${t.group.classroom.level} ${t.group.classroom.name}`,
    academicYear: t.group.classroom.academicYear,
    semester: t.group.classroom.semester,
    type: t.type,
    startDate: t.startDate,
    endDate: t.endDate,
    description: t.description,
    status: t.status,
    progressPercent: t.progressPercent,
  }));
}
