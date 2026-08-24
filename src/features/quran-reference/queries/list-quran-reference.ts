import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface SurahTableData {
  id: number;
  name: string;
  verseCount: number;
}

export interface JuzTableData {
  id: number;
  name: string;
}

export interface SurahJuzTableData {
  id: number;
  surahName: string;
  juzName: string;
  startVerse: number;
  endVerse: number;
}

export interface WafaTableData {
  id: number;
  name: string;
  pageCount: number;
}

export async function listSurah(): Promise<SurahTableData[]> {
  await requireRoleOrThrow(['superadmin']);

  return prisma.surah.findMany({ orderBy: { id: 'asc' } });
}

export async function listJuz(): Promise<JuzTableData[]> {
  await requireRoleOrThrow(['superadmin']);

  return prisma.juz.findMany({ orderBy: { id: 'asc' } });
}

export async function listSurahJuz(): Promise<SurahJuzTableData[]> {
  await requireRoleOrThrow(['superadmin']);

  const surahJuz = await prisma.surahJuz.findMany({
    include: { surah: true, juz: true },
    orderBy: { id: 'asc' },
  });

  return surahJuz.map((item) => ({
    id: item.id,
    surahName: item.surah.name,
    juzName: item.juz.name,
    startVerse: item.startVerse,
    endVerse: item.endVerse,
  }));
}

export async function listWafa(): Promise<WafaTableData[]> {
  await requireRoleOrThrow(['superadmin']);

  return prisma.wafa.findMany({ orderBy: { id: 'asc' } });
}
