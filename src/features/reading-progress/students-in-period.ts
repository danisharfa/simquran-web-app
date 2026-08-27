import { prisma } from '@/lib/prisma';
import type { Semester } from '@/lib/generated/prisma/enums';

export interface StudentInPeriod {
  userId: string;
  name: string;
}

/**
 * Siswa yang tercatat pada suatu periode (tahun ajaran+semester) — gabungan dari
 * GroupHistory (siswa yang sudah naik/pindah kelompok) dan Group aktif saat ini,
 * dedupe by userId. Meniru logika periode kumulatif dari sim-siswa-sdit.
 */
export async function getStudentsInPeriod(
  academicYear: string,
  semester: Semester,
  classroomId: string | null,
  groupId: string | null,
  teacherId: string | null,
): Promise<StudentInPeriod[]> {
  const groupRelationFilter =
    classroomId || teacherId
      ? { ...(classroomId && { classroomId }), ...(teacherId && { teacherId }) }
      : undefined;

  const [groupHistories, activeGroups] = await Promise.all([
    prisma.groupHistory.findMany({
      where: {
        academicYear,
        semester,
        ...(groupId ? { groupId } : groupRelationFilter ? { group: groupRelationFilter } : {}),
      },
      include: { student: { include: { user: true } } },
    }),
    prisma.group.findMany({
      where: {
        classroom: { academicYear, semester },
        ...(groupId && { id: groupId }),
        ...(classroomId && { classroomId }),
        ...(teacherId && { teacherId }),
      },
      include: { students: { include: { user: true } } },
    }),
  ]);

  const map = new Map<string, StudentInPeriod>();

  for (const gh of groupHistories) {
    map.set(gh.student.userId, { userId: gh.student.userId, name: gh.student.user.name });
  }
  for (const group of activeGroups) {
    for (const student of group.students) {
      map.set(student.userId, { userId: student.userId, name: student.user.name });
    }
  }

  return Array.from(map.values());
}

/**
 * Filter kumulatif: semua data sebelum tahun ajaran terpilih, ditambah data
 * tahun ajaran terpilih sampai semester yang dipilih (Genap = Ganjil+Genap).
 */
export function cumulativePeriodFilter(academicYear: string, semester: Semester) {
  return {
    OR: [
      { academicYear: { lt: academicYear } },
      {
        academicYear,
        semester:
          semester === 'GENAP'
            ? { in: ['GANJIL', 'GENAP'] as Semester[] }
            : ('GANJIL' as Semester),
      },
    ],
  };
}
