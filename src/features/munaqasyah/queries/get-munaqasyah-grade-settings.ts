import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';
import type { MunaqasyahGradeSettingData } from '../munaqasyah-scoring';

export async function getMunaqasyahGradeSettings(): Promise<MunaqasyahGradeSettingData[]> {
  await requireSession();

  const settings = await prisma.munaqasyahGradeSetting.findMany({ orderBy: { minScore: 'desc' } });

  return settings.map((s) => ({ grade: s.grade, minScore: s.minScore, label: s.label }));
}
