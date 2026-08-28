import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';
import type { GradeLetterSettingData } from '../grade';

export async function getGradeLetterSettings(): Promise<GradeLetterSettingData[]> {
  await requireSession();

  const settings = await prisma.gradeLetterSetting.findMany({ orderBy: { minScore: 'desc' } });

  return settings.map((s) => ({ grade: s.grade, minScore: s.minScore, description: s.description }));
}
