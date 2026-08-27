import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';

export interface TashihRequestTableData {
  id: string;
  studentName: string;
  groupId: string;
  groupName: string;
  classroomId: string;
  classroomName: string;
  academicYear: string;
  semester: string;
  tashihType: string;
  detail: string;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export async function listMyTashihRequests(): Promise<TashihRequestTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const requests = await prisma.tashihRequest.findMany({
    where: { teacherId: session.user.id },
    include: {
      student: { include: { user: true } },
      group: { include: { classroom: true } },
      juz: true,
      surah: true,
      wafa: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((r) => ({
    id: r.id,
    studentName: r.student.user.name,
    groupId: r.groupId,
    groupName: r.group.name,
    classroomId: r.group.classroomId,
    classroomName: `${r.group.classroom.level} ${r.group.classroom.name}`,
    academicYear: r.group.classroom.academicYear,
    semester: r.group.classroom.semester,
    tashihType: r.tashihType,
    detail: formatTashihDetail(r),
    status: r.status,
    notes: r.notes,
    createdAt: r.createdAt,
  }));
}
