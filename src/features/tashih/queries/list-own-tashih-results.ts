import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { formatTashihDetail } from '../format-tashih-detail';
import type { TashihResultTableData } from './list-all-tashih-results';

export async function listOwnTashihResults(): Promise<TashihResultTableData[]> {
  const session = await requireRoleOrThrow(['student']);

  const results = await prisma.tashihResult.findMany({
    where: { request: { studentId: session.user.id } },
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
    nis: r.request.student.nis,
    studentName: r.request.student.user.name,
    groupId: r.request.groupId,
    groupName: r.request.group.name,
    classroomId: r.request.group.classroomId,
    classroomName: `${r.request.group.classroom.level} ${r.request.group.classroom.name}`,
    academicYear: r.request.group.classroom.academicYear,
    semester: r.request.group.classroom.semester,
    tashihType: r.request.tashihType,
    juzId: r.request.juzId,
    juzName: r.request.juz?.name ?? null,
    surahId: r.request.surahId,
    surahName: r.request.surah?.name ?? null,
    detail: formatTashihDetail(r.request),
    scheduleDate: r.schedule.date,
    passed: r.passed,
    notes: r.notes,
  }));
}
