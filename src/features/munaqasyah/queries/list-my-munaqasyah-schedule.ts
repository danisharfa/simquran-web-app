import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MyMunaqasyahScheduleParticipant {
  requestId: string;
  nis: string;
  studentName: string;
  tahap: string;
  jenis: string;
  juzName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
}

export interface MyMunaqasyahScheduleData {
  scheduleId: string;
  date: Date;
  sessionName: string;
  startTime: string;
  endTime: string;
  location: string;
  participants: MyMunaqasyahScheduleParticipant[];
}

export async function listMyMunaqasyahSchedule(): Promise<MyMunaqasyahScheduleData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const entries = await prisma.munaqasyahScheduleRequest.findMany({
    where: {
      OR: [{ request: { teacherId: session.user.id } }, { schedule: { examinerId: session.user.id } }],
    },
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
      nis: e.request.student.nis,
      studentName: e.request.student.user.name,
      tahap: e.request.tahap,
      jenis: e.request.jenis,
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
