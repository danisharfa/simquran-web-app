import { prisma } from '@/lib/prisma';
import { isRangeFullyCovered } from './is-range-covered';

interface CoverageInput {
  tashihType: 'ALQURAN' | 'WAFA';
  juzId: number | null;
  surahId: number | null;
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
}

export async function validateTashihCoverage(
  studentId: string,
  input: CoverageInput,
): Promise<{ valid: true } | { valid: false; message: string }> {
  if (input.tashihType === 'ALQURAN') {
    const surahJuz = await prisma.surahJuz.findFirst({
      where: { surahId: input.surahId!, juzId: input.juzId! },
    });
    if (!surahJuz) {
      return { valid: false, message: 'Surah tidak termasuk dalam juz yang dipilih' };
    }

    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        submissionType: 'TAHFIDZ',
        submissionStatus: 'LULUS',
        surahId: input.surahId!,
      },
      select: { startVerse: true, endVerse: true },
    });

    const covered = isRangeFullyCovered(
      surahJuz.startVerse,
      surahJuz.endVerse,
      submissions
        .filter((s) => s.startVerse != null && s.endVerse != null)
        .map((s) => ({ start: s.startVerse!, end: s.endVerse! })),
    );

    if (!covered) {
      return {
        valid: false,
        message: 'Surah pada juz ini belum disetor penuh (lulus) oleh siswa, tashih belum bisa diajukan',
      };
    }
  } else {
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        submissionType: 'TAHSIN_WAFA',
        submissionStatus: 'LULUS',
        wafaId: input.wafaId!,
      },
      select: { startPage: true, endPage: true },
    });

    const covered = isRangeFullyCovered(
      input.startPage!,
      input.endPage!,
      submissions
        .filter((s) => s.startPage != null && s.endPage != null)
        .map((s) => ({ start: s.startPage!, end: s.endPage! })),
    );

    if (!covered) {
      return {
        valid: false,
        message: 'Halaman Wafa ini belum disetor penuh (lulus) oleh siswa, tashih belum bisa diajukan',
      };
    }
  }

  return { valid: true };
}
