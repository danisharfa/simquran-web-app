import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MyMunaqasyahScheduleData, MyMunaqasyahScheduleParticipant } from './list-my-munaqasyah-schedule';

export async function listOwnMunaqasyahSchedule(): Promise<MyMunaqasyahScheduleData[]> {
  const session = await requireRoleOrThrow(['student']);

  const entries = await prisma.munaqasyahScheduleRequest.findMany({
    where: { request: { studentId: session.user.id } },
    include: {
      schedule: true,
      request: { include: { student: { include: { user: true } }, juz: true, group: { include: { classroom: true } } } },
    },
    orderBy: { schedule: { date: 'desc' } },
  });

  const map = new Map<string, MyMunaqasyahScheduleData>();
  for (const e of entries) {
    const participant: MyMunaqasyahScheduleParticipant = {
      requestId: e.requestId,
      studentName: e.request.student.user.name,
      batch: e.request.batch,
      stage: e.request.stage,
      juzName: e.request.juz.name,
      groupId: e.request.groupId,
      groupName: e.request.group.name,
      classroomId: e.request.group.classroomId,
      classroomName: `${e.request.group.classroom.level} ${e.request.group.classroom.name}`,
      academicYear: e.request.group.classroom.academicYear,
      semester: e.request.group.classroom.semester,
    };
    const existing = map.get(e.scheduleId);
    if (existing) {
      existing.participants.push(participant);
    } else {
      map.set(e.scheduleId, {
        scheduleId: e.scheduleId,
        date: e.schedule.date,
        sessionName: e.schedule.sessionName,
        startTime: e.schedule.startTime,
        endTime: e.schedule.endTime,
        location: e.schedule.location,
        participants: [participant],
      });
    }
  }
  return Array.from(map.values());
}
