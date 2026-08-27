import { prisma } from '@/lib/prisma';
import type { Semester } from '@/lib/generated/prisma/enums';
import { cumulativePeriodFilter, type StudentInPeriod } from './students-in-period';
import { toStatus, type StudentProgress } from './types';

/** Progres Wafa: jumlah halaman per buku Wafa yang sudah lulus tashih (jenis WAFA). */
export async function computeWafaProgress(
  students: StudentInPeriod[],
  academicYear: string,
  semester: Semester,
): Promise<StudentProgress[]> {
  const [wafaBooks, tashihRequests] = await Promise.all([
    prisma.wafa.findMany({ orderBy: { id: 'asc' } }),
    prisma.tashihRequest.findMany({
      where: {
        studentId: { in: students.map((s) => s.userId) },
        tashihType: 'WAFA',
        status: 'SELESAI',
        result: { passed: true },
        group: { classroom: cumulativePeriodFilter(academicYear, semester) },
      },
      select: { studentId: true, wafaId: true, startPage: true, endPage: true },
    }),
  ]);

  return students.map((student) => {
    const studentRequests = tashihRequests.filter((r) => r.studentId === student.userId);

    const progress = wafaBooks.map((book) => {
      const completedPages = studentRequests
        .filter((r) => r.wafaId === book.id)
        .reduce((sum, r) => {
          if (r.startPage == null || r.endPage == null) return sum;
          return sum + (r.endPage - r.startPage + 1);
        }, 0);

      return {
        id: book.id,
        name: book.name,
        completed: completedPages,
        total: book.pageCount,
        percent: book.pageCount > 0 ? Math.round((completedPages / book.pageCount) * 1000) / 10 : 0,
        status: toStatus(completedPages, book.pageCount),
      };
    });

    return { studentId: student.userId, studentName: student.name, progress };
  });
}
