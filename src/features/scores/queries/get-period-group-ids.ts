import { prisma } from '@/lib/prisma';
import type { Semester } from '@/lib/generated/prisma/enums';

export interface PeriodGroupIds {
  allGroupIds: string[];
  currentGroupId: string | null;
}

/**
 * Resolusi kelompok siswa untuk satu periode (tahun ajaran + semester), mendukung
 * siswa yang pindah kelompok di tengah periode: `allGroupIds` untuk scope agregasi nilai,
 * `currentGroupId` (kelompok terakhir secara kronologis) untuk keperluan tampilan.
 */
export async function getPeriodGroupIds(
  studentId: string,
  academicYear: string,
  semester: Semester,
): Promise<PeriodGroupIds> {
  const [histories, student] = await Promise.all([
    prisma.groupHistory.findMany({
      where: { studentId, academicYear, semester },
      orderBy: { createdAt: 'asc' },
      select: { groupId: true },
    }),
    prisma.studentProfile.findUnique({
      where: { userId: studentId },
      select: { groupId: true, group: { select: { classroom: true } } },
    }),
  ]);

  const idsInOrder = histories.map((h) => h.groupId);

  const isCurrentInPeriod =
    student?.groupId &&
    student.group?.classroom.academicYear === academicYear &&
    student.group?.classroom.semester === semester;

  if (isCurrentInPeriod && student?.groupId) {
    idsInOrder.push(student.groupId);
  }

  return {
    allGroupIds: Array.from(new Set(idsInOrder)),
    currentGroupId: idsInOrder[idsInOrder.length - 1] ?? null,
  };
}
