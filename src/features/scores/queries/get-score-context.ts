import { prisma } from '@/lib/prisma';
import { assertReportAccess } from '../assert-report-access';
import { getPeriodGroupIds } from './get-period-group-ids';

export interface ScoreContext {
  studentName: string;
  nis: string;
  groupName: string;
}

export async function getScoreContext(studentId: string, groupId: string): Promise<ScoreContext> {
  await assertReportAccess(studentId, groupId);

  const [student, group] = await Promise.all([
    prisma.studentProfile.findUniqueOrThrow({ where: { userId: studentId }, include: { user: true } }),
    prisma.group.findUniqueOrThrow({ where: { id: groupId }, include: { classroom: true } }),
  ]);

  const { currentGroupId } = await getPeriodGroupIds(
    studentId,
    group.classroom.academicYear,
    group.classroom.semester,
  );

  const displayGroup =
    currentGroupId && currentGroupId !== groupId
      ? await prisma.group.findUnique({ where: { id: currentGroupId } })
      : group;

  return { studentName: student.user.name, nis: student.nis, groupName: (displayGroup ?? group).name };
}
