'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface MunaqasyahResultEditRow {
  questionNo: number;
  khofiAwalAyat: number;
  khofiMakhroj: number;
  khofiTajwidMad: number;
  jaliBaris: number;
  jaliLebihSatuKalimat: number;
  note: string;
}

export interface MunaqasyahResultEditData {
  requestId: string;
  rows: MunaqasyahResultEditRow[];
}

export async function getMunaqasyahResult(resultId: string): Promise<MunaqasyahResultEditData> {
  await requireRoleOrThrow(['coordinator']);

  const result = await prisma.munaqasyahResult.findUniqueOrThrow({
    where: { id: resultId },
    include: {
      request: true,
      munaqasyahDetails: { orderBy: { questionNo: 'asc' } },
    },
  });

  if (result.request.jenis !== 'MUNAQASYAH') {
    throw new Error('Hasil ini bukan hasil Munaqasyah');
  }

  return {
    requestId: result.requestId,
    rows: result.munaqasyahDetails.map((d) => ({
      questionNo: d.questionNo,
      khofiAwalAyat: d.khofiAwalAyat,
      khofiMakhroj: d.khofiMakhroj,
      khofiTajwidMad: d.khofiTajwidMad,
      jaliBaris: d.jaliBaris,
      jaliLebihSatuKalimat: d.jaliLebihSatuKalimat,
      note: d.note ?? '',
    })),
  };
}
