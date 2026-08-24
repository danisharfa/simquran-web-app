import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MyMunaqasyahScheduleData } from './list-my-munaqasyah-schedule';

export async function listOwnMunaqasyahSchedule(): Promise<MyMunaqasyahScheduleData[]> {
  const session = await requireRoleOrThrow(['student']);

  const entries = await prisma.munaqasyahScheduleRequest.findMany({
    where: { request: { studentId: session.user.id } },
    include: {
      schedule: true,
      request: { include: { student: { include: { user: true } }, juz: true } },
    },
    orderBy: { schedule: { date: 'desc' } },
  });

  return entries.map((e) => ({
    requestId: e.requestId,
    studentName: e.request.student.user.name,
    batch: e.request.batch,
    stage: e.request.stage,
    juzName: e.request.juz.name,
    date: e.schedule.date,
    sessionName: e.schedule.sessionName,
    startTime: e.schedule.startTime,
    endTime: e.schedule.endTime,
    location: e.schedule.location,
  }));
}
