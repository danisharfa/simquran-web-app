import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface TashihResultTableData {
  id: string;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
  detail: string;
  scheduleDate: Date;
  passed: boolean;
  notes: string | null;
}

export async function listAllTashihResults(): Promise<TashihResultTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const results = await prisma.tashihResult.findMany({
    include: {
      schedule: true,
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
    orderBy: { createdAt: 'desc' },
  });

  return results.map((r) => ({
    id: r.id,
    studentName: r.request.student.user.name,
    groupId: r.request.groupId,
    groupName: r.request.group.name,
    classroomId: r.request.group.classroomId,
    classroomName: `${r.request.group.classroom.level} ${r.request.group.classroom.name}`,
    academicYear: r.request.group.classroom.academicYear,
    semester: r.request.group.classroom.semester,
    detail: formatTashihDetail(r.request),
    scheduleDate: r.schedule.date,
    passed: r.passed,
    notes: r.notes,
  }));
}
