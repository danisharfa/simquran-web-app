import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-role';

export interface ReferenceOption {
  id: number;
  name: string;
}

export async function listSurahOptions(): Promise<ReferenceOption[]> {
  await requireSession();
  return prisma.surah.findMany({ select: { id: true, name: true }, orderBy: { id: 'asc' } });
}

export async function listJuzOptions(): Promise<ReferenceOption[]> {
  await requireSession();
  return prisma.juz.findMany({ select: { id: true, name: true }, orderBy: { id: 'asc' } });
}

export async function listWafaOptions(): Promise<ReferenceOption[]> {
  await requireSession();
  return prisma.wafa.findMany({ select: { id: true, name: true }, orderBy: { id: 'asc' } });
}

export interface SurahJuzMapping {
  surahId: number;
  juzId: number;
}

/** Mapping surah-juz agar dropdown Surah bisa difilter sesuai Juz yang dipilih. */
export async function listSurahJuzMap(): Promise<SurahJuzMapping[]> {
  await requireSession();
  return prisma.surahJuz.findMany({ select: { surahId: true, juzId: true } });
}
