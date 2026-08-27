import { prisma } from '@/lib/prisma';
import { mergeIntervals, overlapLength, type Interval } from '@/lib/interval-utils';

/**
 * Recomputes progressPercent/status for every WeeklyTarget belonging to a student,
 * based on their LULUS Submission rows overlapping each target's date range and reading range.
 * Called after any submission create/update/delete so progress stays in sync automatically.
 */
export async function recalculateWeeklyTargetsForStudent(studentId: string): Promise<void> {
  const targets = await prisma.weeklyTarget.findMany({ where: { studentId } });
  if (targets.length === 0) return;

  const submissions = await prisma.submission.findMany({
    where: { studentId, submissionStatus: 'LULUS' },
    select: {
      submissionType: true,
      date: true,
      surahId: true,
      startVerse: true,
      endVerse: true,
      wafaId: true,
      startPage: true,
      endPage: true,
    },
  });

  const surahIds = new Set<number>();
  for (const target of targets) {
    if (target.surahStartId != null) surahIds.add(target.surahStartId);
    if (target.surahEndId != null) surahIds.add(target.surahEndId);
  }

  const surahs = surahIds.size
    ? await prisma.surah.findMany({
        where: { id: { in: Array.from(surahIds) } },
        select: { id: true, verseCount: true },
      })
    : [];
  const verseCountBySurah = new Map(surahs.map((s) => [s.id, s.verseCount]));

  for (const target of targets) {
    const relevantSubmissions = submissions.filter(
      (s) => s.submissionType === target.type && s.date >= target.startDate && s.date <= target.endDate,
    );

    let total = 0;
    let matched = 0;

    if (target.type === 'TAHSIN_WAFA') {
      if (target.wafaId != null && target.startPage != null && target.endPage != null) {
        const required: Interval = { start: target.startPage, end: target.endPage };
        total = required.end - required.start + 1;

        const actualIntervals = relevantSubmissions
          .filter((s) => s.wafaId === target.wafaId && s.startPage != null && s.endPage != null)
          .map((s) => ({ start: s.startPage!, end: s.endPage! }));

        const summed = mergeIntervals(actualIntervals).reduce(
          (sum, interval) => sum + overlapLength(required, interval),
          0,
        );

        matched = Math.min(total, summed);
      }
    } else if (
      target.surahStartId != null &&
      target.surahEndId != null &&
      target.startAyat != null &&
      target.endAyat != null
    ) {
      const startId = target.surahStartId;
      const endId = target.surahEndId;
      const step = startId <= endId ? 1 : -1;

      for (let surahId = startId; step === 1 ? surahId <= endId : surahId >= endId; surahId += step) {
        const verseCount = verseCountBySurah.get(surahId);
        if (verseCount == null) continue;

        const required: Interval = {
          start: surahId === target.surahStartId ? target.startAyat : 1,
          end: surahId === target.surahEndId ? target.endAyat : verseCount,
        };
        const requiredSize = required.end - required.start + 1;
        if (requiredSize <= 0) continue;

        const actualIntervals = relevantSubmissions
          .filter((s) => s.surahId === surahId && s.startVerse != null && s.endVerse != null)
          .map((s) => ({ start: s.startVerse!, end: s.endVerse! }));

        const summed = mergeIntervals(actualIntervals).reduce(
          (sum, interval) => sum + overlapLength(required, interval),
          0,
        );

        total += requiredSize;
        matched += Math.min(requiredSize, summed);
      }
    }

    const progressPercent = total > 0 ? Math.min(100, Math.round((matched / total) * 100)) : 0;
    const status = progressPercent >= 100 ? 'TERCAPAI' : 'TIDAK_TERCAPAI';

    if (target.progressPercent !== progressPercent || target.status !== status) {
      await prisma.weeklyTarget.update({
        where: { id: target.id },
        data: { progressPercent, status },
      });
    }
  }
}
