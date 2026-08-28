import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatWeeklyTargetDetail } from '../format-weekly-target-detail';
import type { WeeklyTargetTableData } from './list-my-weekly-targets';

export async function listOwnWeeklyTargets(): Promise<WeeklyTargetTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const targets = await prisma.weeklyTarget.findMany({
    where: { studentId: session.user.id },
    include: {
      student: { include: { user: true } },
      group: { include: { classroom: true } },
      juzStart: true,
      juzEnd: true,
      surahStart: true,
      surahEnd: true,
      wafa: true,
    },
    orderBy: { startDate: 'desc' },
  });

  return targets.map((t) => ({
    id: t.id,
    studentId: t.studentId,
    nis: t.student.nis,
    studentName: t.student.user.name,
    groupId: t.groupId,
    groupName: t.group.name,
    classroomId: t.group.classroomId,
    classroomName: `${t.group.classroom.level} ${t.group.classroom.name}`,
    academicYear: t.group.classroom.academicYear,
    semester: t.group.classroom.semester,
    type: t.type,
    detail: formatWeeklyTargetDetail(t),
    startDate: t.startDate,
    endDate: t.endDate,
    description: t.description,
    status: t.status,
    progressPercent: t.progressPercent,
  }));
}
