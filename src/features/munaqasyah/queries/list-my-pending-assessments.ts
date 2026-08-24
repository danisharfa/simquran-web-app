import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface PendingAssessment {
  requestId: string;
  studentName: string;
  stage: 'TASMI' | 'MUNAQASYAH';
  juzId: number;
  juzName: string;
  scheduleLabel: string;
}

export async function listMyPendingAssessments(): Promise<PendingAssessment[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const entries = await prisma.munaqasyahScheduleRequest.findMany({
    where: {
      schedule: { examinerId: session.user.id },
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
    stage: e.request.stage,
    juzId: e.request.juzId,
    juzName: e.request.juz.name,
    scheduleLabel: `${e.schedule.date.toLocaleDateString('id-ID')} - ${e.schedule.sessionName} (${e.schedule.location})`,
  }));
}
