import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MyMunaqasyahScheduleData {
  requestId: string;
  studentName: string;
  batch: string;
  stage: string;
  juzName: string;
  date: Date;
  sessionName: string;
  startTime: string;
  endTime: string;
  location: string;
}

export async function listMyMunaqasyahSchedule(): Promise<MyMunaqasyahScheduleData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const entries = await prisma.munaqasyahScheduleRequest.findMany({
    where: { request: { teacherId: session.user.id } },
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
