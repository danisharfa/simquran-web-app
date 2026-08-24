import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';

export interface SurahInJuz {
  surahId: number;
  surahName: string;
}

export async function listSurahsInJuz(juzId: number): Promise<SurahInJuz[]> {
  await requireSession();

  const entries = await prisma.surahJuz.findMany({
    where: { juzId },
    include: { surah: true },
    orderBy: { id: 'asc' },
  });

  return entries.map((e) => ({ surahId: e.surahId, surahName: e.surah.name }));
}
