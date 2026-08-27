import { prisma } from '@/lib/prisma';
import type { SubmissionSchema } from './submission.schema';

interface CheckParams {
  studentId: string;
  data: SubmissionSchema;
  excludeId?: string;
}

/**
 * Guards against re-entering the same reading range twice (same day) and against
 * re-submitting a range the student has already passed — both were ways a duplicate
 * LULUS submission could silently inflate weekly-target progress past 100%.
 */
export async function findDuplicateSubmissionMessage({
  studentId,
  data,
  excludeId,
}: CheckParams): Promise<string | null> {
  const rangeWhere =
    data.submissionType === 'TAHSIN_WAFA'
      ? { wafaId: data.wafaId, startPage: data.startPage, endPage: data.endPage }
      : { surahId: data.surahId, startVerse: data.startVerse, endVerse: data.endVerse };

  const dayStart = new Date(data.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const sameDay = await prisma.submission.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      studentId,
      submissionType: data.submissionType,
      date: { gte: dayStart, lte: dayEnd },
      ...rangeWhere,
    },
    select: { id: true },
  });
  if (sameDay) {
    return 'Setoran ini sudah pernah diinput pada tanggal tersebut.';
  }

  const alreadyPassed = await prisma.submission.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      studentId,
      submissionType: data.submissionType,
      submissionStatus: 'LULUS',
      ...rangeWhere,
    },
    select: { id: true },
  });
  if (alreadyPassed) {
    return 'Siswa sudah lulus pada bacaan ini, tidak perlu diinput ulang.';
  }

  return null;
}
