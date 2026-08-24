import { prisma } from '@/lib/prisma';
import { assertReportAccess } from '../assert-report-access';

export interface TahsinScoreData {
  id: string;
  tahsinType: string;
  topic: string;
  score: number;
  grade: string;
  description: string | null;
}

export async function listTahsinScores(studentId: string, groupId: string): Promise<TahsinScoreData[]> {
  await assertReportAccess(studentId, groupId);

  const scores = await prisma.tahsinScore.findMany({
    where: { studentId, groupId },
    orderBy: { createdAt: 'asc' },
  });

  return scores.map((s) => ({
    id: s.id,
    tahsinType: s.tahsinType,
    topic: s.topic,
    score: s.score,
    grade: s.grade,
    description: s.description,
  }));
}
