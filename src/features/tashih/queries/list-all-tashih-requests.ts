import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';
import type { TashihRequestTableData } from './list-my-tashih-requests';

export type { TashihRequestTableData };

export async function listAllTashihRequests(): Promise<TashihRequestTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const requests = await prisma.tashihRequest.findMany({
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
    nis: r.student.nis,
    studentName: r.student.user.name,
    groupId: r.groupId,
    groupName: r.group.name,
    classroomId: r.group.classroomId,
    classroomName: `${r.group.classroom.level} ${r.group.classroom.name}`,
    academicYear: r.group.classroom.academicYear,
    semester: r.group.classroom.semester,
    tashihType: r.tashihType,
    juzId: r.juzId,
    juzName: r.juz?.name ?? null,
    surahId: r.surahId,
    surahName: r.surah?.name ?? null,
    detail: formatTashihDetail(r),
    status: r.status,
    notes: r.notes,
    createdAt: r.createdAt,
  }));
}
