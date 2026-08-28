import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { PendingAssessment } from './list-my-pending-assessments';

export async function listAllPendingAssessments(): Promise<PendingAssessment[]> {
  await requireRoleOrThrow(['coordinator']);

  const entries = await prisma.munaqasyahScheduleRequest.findMany({
    where: {
      request: { result: null },
    },
    include: {
      schedule: true,
      request: { include: { student: { include: { user: true } }, juz: true } },
    },
    orderBy: { schedule: { date: 'desc' } },
  });

  return entries.map((e) => ({
    requestId: e.requestId,
    studentName: e.request.student.user.name,
    jenis: e.request.jenis,
    juzId: e.request.juzId,
    juzName: e.request.juz.name,
    scheduleLabel: `${e.schedule.date.toLocaleDateString('id-ID')} - ${e.schedule.sessionName} (${e.schedule.location})`,
  }));
}
