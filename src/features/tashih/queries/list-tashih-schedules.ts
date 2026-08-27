import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface TashihScheduleParticipant {
  requestId: string;
  studentName: string;
  detail: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
}

export interface TashihScheduleTableData {
  id: string;
  date: Date;
  sessionName: string;
  startTime: string;
  endTime: string;
  location: string;
  participants: TashihScheduleParticipant[];
}

export async function listTashihSchedules(): Promise<TashihScheduleTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const schedules = await prisma.tashihSchedule.findMany({
    include: {
      scheduleRequests: {
        include: {
          request: {
            include: {
              student: { include: { user: true } },
              juz: true,
              surah: true,
              wafa: true,
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
    participants: s.scheduleRequests.map((sr) => ({
      requestId: sr.request.id,
      studentName: sr.request.student.user.name,
      detail: formatTashihDetail(sr.request),
      groupId: sr.request.groupId,
      groupName: sr.request.group.name,
      classroomId: sr.request.group.classroomId,
      classroomName: `${sr.request.group.classroom.level} ${sr.request.group.classroom.name}`,
      academicYear: sr.request.group.classroom.academicYear,
      semester: sr.request.group.classroom.semester,
    })),
  }));
}
