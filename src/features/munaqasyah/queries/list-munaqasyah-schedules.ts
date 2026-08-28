import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahScheduleParticipant {
  requestId: string;
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

export interface MunaqasyahScheduleTableData {
  id: string;
  date: Date;
  sessionName: string;
  startTime: string;
  endTime: string;
  location: string;
  examinerId: string | null;
  examinerName: string | null;
  participants: MunaqasyahScheduleParticipant[];
}

export async function listMunaqasyahSchedules(): Promise<MunaqasyahScheduleTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const schedules = await prisma.munaqasyahSchedule.findMany({
    include: {
      examiner: { include: { user: true } },
      scheduleRequests: {
        include: {
          request: {
            include: {
              student: { include: { user: true } },
              juz: true,
              group: { include: { classroom: true } },
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return schedules.map((s) => ({
    id: s.id,
    date: s.date,
    sessionName: s.sessionName,
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
    examinerId: s.examinerId,
    examinerName: s.examiner?.user.name ?? null,
    participants: s.scheduleRequests.map((sr) => ({
      requestId: sr.request.id,
      studentName: sr.request.student.user.name,
      tahap: sr.request.tahap,
      jenis: sr.request.jenis,
      juzName: sr.request.juz.name,
      groupId: sr.request.groupId,
      groupName: sr.request.group.name,
      classroomId: sr.request.group.classroomId,
      classroomName: `${sr.request.group.classroom.level} ${sr.request.group.classroom.name}`,
      academicYear: sr.request.group.classroom.academicYear,
      semester: sr.request.group.classroom.semester,
    })),
  }));
}
