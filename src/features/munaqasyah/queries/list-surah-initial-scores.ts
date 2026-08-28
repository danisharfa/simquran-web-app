import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface SurahInitialScoreData {
  surahId: number;
  surahName: string;
  initialScore: number;
}

export async function listSurahInitialScores(): Promise<SurahInitialScoreData[]> {
  await requireRoleOrThrow(['superadmin', 'admin']);

  const surahs = await prisma.surah.findMany({ orderBy: { id: 'asc' } });

  return surahs.map((s) => ({ surahId: s.id, surahName: s.name, initialScore: s.initialScore }));
}
