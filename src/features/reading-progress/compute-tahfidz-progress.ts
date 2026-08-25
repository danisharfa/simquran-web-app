import { prisma } from '@/lib/prisma';
import type { Semester } from '@/lib/generated/prisma/enums';
import { cumulativePeriodFilter, type StudentInPeriod } from './students-in-period';
import { toStatus, type StudentProgress } from './types';

/** Progres Tahfidz: jumlah surah per juz yang sudah SELESAI di-tashih (jenis ALQURAN). */
export async function computeTahfidzProgress(
  students: StudentInPeriod[],
  academicYear: string,
  semester: Semester,
): Promise<StudentProgress[]> {
  const [allJuz, tashihRequests] = await Promise.all([
    prisma.juz.findMany({ include: { surahJuz: true }, orderBy: { id: 'asc' } }),
    prisma.tashihRequest.findMany({
      where: {
        studentId: { in: students.map((s) => s.userId) },
        tashihType: 'ALQURAN',
        status: 'SELESAI',
        group: { classroom: cumulativePeriodFilter(academicYear, semester) },
      },
      select: { studentId: true, juzId: true, surahId: true },
    }),
  ]);

  const surahCountByJuz = new Map(allJuz.map((j) => [j.id, j.surahJuz.length]));

  return students.map((student) => {
    const studentRequests = tashihRequests.filter((r) => r.studentId === student.userId);

    const progress = allJuz.map((juz) => {
      const completed = studentRequests.filter((r) => r.juzId === juz.id).length;
      const total = surahCountByJuz.get(juz.id) ?? 0;

      return {
        id: juz.id,
        name: juz.name,
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
        status: toStatus(completed, total),
      };
    });

    return { studentId: student.userId, studentName: student.name, progress };
  });
}
