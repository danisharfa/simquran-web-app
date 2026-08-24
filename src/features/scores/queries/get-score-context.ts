import { prisma } from '@/lib/prisma';
import { assertReportAccess } from '../assert-report-access';

export interface ScoreContext {
  studentName: string;
  nis: string;
  groupName: string;
}

export async function getScoreContext(studentId: string, groupId: string): Promise<ScoreContext> {
  await assertReportAccess(studentId, groupId);

  const student = await prisma.studentProfile.findUniqueOrThrow({
    where: { userId: studentId },
    include: { user: true },
  });
  const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId } });

  return { studentName: student.user.name, nis: student.nis, groupName: group.name };
}
