'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface TasmiResultEditRow {
  surahId: number;
  surahName: string;
  initialScore: number;
  khofiAwalAyat: number;
  khofiMakhroj: number;
  khofiTajwidMad: number;
  jaliBaris: number;
  jaliLebihSatuKalimat: number;
  note: string;
}

export interface TasmiResultEditData {
  requestId: string;
  rows: TasmiResultEditRow[];
}

export async function getTasmiResult(resultId: string): Promise<TasmiResultEditData> {
  await requireRoleOrThrow(['coordinator']);

  const result = await prisma.munaqasyahResult.findUniqueOrThrow({
    where: { id: resultId },
    include: {
      request: true,
      tasmiDetails: { include: { surah: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  if (result.request.jenis !== 'TASMI') {
    throw new Error('Hasil ini bukan hasil Tasmi');
  }

  return {
    requestId: result.requestId,
    rows: result.tasmiDetails.map((d) => ({
      surahId: d.surahId,
      surahName: d.surah.name,
      initialScore: d.initialScore,
      khofiAwalAyat: d.khofiAwalAyat,
      khofiMakhroj: d.khofiMakhroj,
      khofiTajwidMad: d.khofiTajwidMad,
      jaliBaris: d.jaliBaris,
      jaliLebihSatuKalimat: d.jaliLebihSatuKalimat,
      note: d.note ?? '',
    })),
  };
}
