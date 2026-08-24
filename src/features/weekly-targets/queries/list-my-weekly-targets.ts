import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface WeeklyTargetTableData {
  id: string;
  studentName: string;
  groupName: string;
  type: string;
  startDate: Date;
  endDate: Date;
  description: string;
  status: string;
  progressPercent: number | null;
}

export async function listMyWeeklyTargets(): Promise<WeeklyTargetTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const targets = await prisma.weeklyTarget.findMany({
    where: { teacherId: session.user.id },
    include: { student: { include: { user: true } }, group: true },
    orderBy: { startDate: 'desc' },
  });

  return targets.map((t) => ({
    id: t.id,
    studentName: t.student.user.name,
    groupName: t.group.name,
    type: t.type,
    startDate: t.startDate,
    endDate: t.endDate,
    description: t.description,
    status: t.status,
    progressPercent: t.progressPercent,
  }));
}
