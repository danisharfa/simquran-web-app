import { prisma } from '@/lib/prisma';
import { overlapLength, type Interval } from '@/lib/interval-utils';

/**
 * Submissions backing an active (non-DITOLAK) tashih request's coverage must
 * stay untouched — deleting/editing them would invalidate evidence a
 * coordinator already relied on (or will rely on) to approve/pass the request.
 * Weekly target completion alone does NOT lock anything: it's self-correcting
 * (editing a submission just recalculates the target's progress), and nothing
 * external depends on it until a tashih request actually exists.
 */
export async function getLockedSubmissionIds(studentId: string): Promise<Set<string>> {
  const locked = new Set<string>();

  const activeRequests = await prisma.tashihRequest.findMany({ where: { studentId, status: { not: 'DITOLAK' } } });
  if (activeRequests.length === 0) return locked;

  const alquranRequests = activeRequests.filter((r) => r.tashihType === 'ALQURAN' && r.surahId != null && r.juzId != null);
  const wafaRequests = activeRequests.filter((r) => r.tashihType === 'WAFA' && r.wafaId != null);

  if (alquranRequests.length > 0) {
    const [surahJuzList, submissions] = await Promise.all([
      prisma.surahJuz.findMany({
        where: { OR: alquranRequests.map((r) => ({ surahId: r.surahId!, juzId: r.juzId! })) },
      }),
      prisma.submission.findMany({
        where: {
          studentId,
          submissionType: 'TAHFIDZ',
          submissionStatus: 'LULUS',
          surahId: { in: Array.from(new Set(alquranRequests.map((r) => r.surahId!))) },
        },
        select: { id: true, surahId: true, startVerse: true, endVerse: true },
      }),
    ]);

    for (const req of alquranRequests) {
      const surahJuz = surahJuzList.find((sj) => sj.surahId === req.surahId && sj.juzId === req.juzId);
      if (!surahJuz) continue;
      const required: Interval = { start: surahJuz.startVerse, end: surahJuz.endVerse };
      for (const s of submissions) {
        if (s.surahId !== req.surahId || s.startVerse == null || s.endVerse == null) continue;
        if (overlapLength(required, { start: s.startVerse, end: s.endVerse }) > 0) locked.add(s.id);
      }
    }
  }

  if (wafaRequests.length > 0) {
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        submissionType: 'TAHSIN_WAFA',
        submissionStatus: 'LULUS',
        wafaId: { in: Array.from(new Set(wafaRequests.map((r) => r.wafaId!))) },
      },
      select: { id: true, wafaId: true, startPage: true, endPage: true },
    });

    for (const req of wafaRequests) {
      if (req.startPage == null || req.endPage == null) continue;
      const required: Interval = { start: req.startPage, end: req.endPage };
      for (const s of submissions) {
        if (s.wafaId !== req.wafaId || s.startPage == null || s.endPage == null) continue;
        if (overlapLength(required, { start: s.startPage, end: s.endPage }) > 0) locked.add(s.id);
      }
    }
  }

  return locked;
}
