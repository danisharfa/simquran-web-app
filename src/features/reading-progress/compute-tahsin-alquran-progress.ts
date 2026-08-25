import { prisma } from '@/lib/prisma';
import type { Semester } from '@/lib/generated/prisma/enums';
import { cumulativePeriodFilter, type StudentInPeriod } from './students-in-period';
import { toStatus, type StudentProgress } from './types';

/** Progres Tahsin Al-Qur'an: jumlah ayat per juz yang sudah LULUS di-setor (submission TAHSIN_ALQURAN). */
export async function computeTahsinAlquranProgress(
  students: StudentInPeriod[],
  academicYear: string,
  semester: Semester,
): Promise<StudentProgress[]> {
  const [allJuz, submissions] = await Promise.all([
    prisma.juz.findMany({ include: { surahJuz: true }, orderBy: { id: 'asc' } }),
    prisma.submission.findMany({
      where: {
        studentId: { in: students.map((s) => s.userId) },
        submissionType: 'TAHSIN_ALQURAN',
        submissionStatus: 'LULUS',
        group: { classroom: cumulativePeriodFilter(academicYear, semester) },
      },
      select: { studentId: true, surahId: true, startVerse: true, endVerse: true },
    }),
  ]);

  return students.map((student) => {
    const studentSubmissions = submissions.filter((s) => s.studentId === student.userId);

    const progress = allJuz.map((juz) => {
      const totalAyah = juz.surahJuz.reduce((sum, sj) => sum + (sj.endVerse - sj.startVerse + 1), 0);

      const completedAyah = studentSubmissions.reduce((sum, s) => {
        if (s.surahId == null || s.startVerse == null || s.endVerse == null) return sum;
        const surahJuzInfo = juz.surahJuz.find((sj) => sj.surahId === s.surahId);
        if (!surahJuzInfo) return sum;

        const overlapStart = Math.max(surahJuzInfo.startVerse, s.startVerse);
        const overlapEnd = Math.min(surahJuzInfo.endVerse, s.endVerse);
        return overlapStart <= overlapEnd ? sum + (overlapEnd - overlapStart + 1) : sum;
      }, 0);

      return {
        id: juz.id,
        name: juz.name,
        completed: completedAyah,
        total: totalAyah,
        percent: totalAyah > 0 ? Math.round((completedAyah / totalAyah) * 1000) / 10 : 0,
        status: toStatus(completedAyah, totalAyah),
      };
    });

    return { studentId: student.userId, studentName: student.name, progress };
  });
}
