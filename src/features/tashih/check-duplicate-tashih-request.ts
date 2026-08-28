import { prisma } from '@/lib/prisma';

interface DuplicateCheckInput {
  tashihType: 'ALQURAN' | 'WAFA';
  juzId: number | null;
  surahId: number | null;
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
}

export async function findDuplicateTashihRequest(
  studentId: string,
  input: DuplicateCheckInput,
  excludeRequestId?: string,
) {
  return prisma.tashihRequest.findFirst({
    where: {
      id: excludeRequestId ? { not: excludeRequestId } : undefined,
      studentId,
      tashihType: input.tashihType,
      ...(input.tashihType === 'ALQURAN'
        ? { juzId: input.juzId, surahId: input.surahId }
        : { wafaId: input.wafaId, startPage: input.startPage, endPage: input.endPage }),
      OR: [{ status: { in: ['MENUNGGU', 'DITERIMA'] } }, { status: 'SELESAI', result: { passed: true } }],
    },
  });
}
