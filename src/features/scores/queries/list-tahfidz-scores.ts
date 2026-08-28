import { prisma } from '@/lib/prisma';
import { assertReportAccess } from '../assert-report-access';
import { getPeriodGroupIds } from './get-period-group-ids';

export interface TahfidzScoreData {
  id: string;
  surahId: number;
  surahName: string;
  score: number;
  grade: string;
  description: string | null;
}

export async function listTahfidzScores(studentId: string, groupId: string): Promise<TahfidzScoreData[]> {
  await assertReportAccess(studentId, groupId);

  const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId }, include: { classroom: true } });
  const { allGroupIds } = await getPeriodGroupIds(
    studentId,
    group.classroom.academicYear,
    group.classroom.semester,
  );
  const groupIds = Array.from(new Set([...allGroupIds, groupId]));

  const scores = await prisma.tahfidzScore.findMany({
    where: { studentId, groupId: { in: groupIds } },
    include: { surah: true },
    orderBy: { surah: { id: 'asc' } },
  });

  return scores.map((s) => ({
    id: s.id,
    surahId: s.surahId,
    surahName: s.surah.name,
    score: s.score,
    grade: s.grade,
    description: s.description,
  }));
}
