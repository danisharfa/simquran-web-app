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
