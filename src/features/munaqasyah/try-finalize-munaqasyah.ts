import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { calculateFinalScore, scoreToGrade } from './munaqasyah-scoring';
import type { MunaqasyahBatch } from '@/lib/generated/prisma/enums';

/**
 * Dipanggil setiap kali satu hasil (Tasmi atau Munaqasyah) tersimpan.
 * Kalau pasangannya (stage lain, siswa+juz+batch+kelompok sama, sudah SELESAI) juga sudah ada,
 * gabungkan jadi MunaqasyahFinalResult (70% Tasmi + 30% Munaqasyah).
 */
export async function tryFinalizeMunaqasyah(
  studentId: string,
  groupId: string,
  juzId: number,
  batch: MunaqasyahBatch,
) {
  const [tasmiRequest, munaqasyahRequest] = await Promise.all([
    prisma.munaqasyahRequest.findFirst({
      where: { studentId, groupId, juzId, batch, stage: 'TASMI', status: 'SELESAI' },
      include: { result: true },
    }),
    prisma.munaqasyahRequest.findFirst({
      where: { studentId, groupId, juzId, batch, stage: 'MUNAQASYAH', status: 'SELESAI' },
      include: { result: true },
    }),
  ]);

  if (!tasmiRequest?.result || !munaqasyahRequest?.result) return;

  const finalScore = calculateFinalScore(tasmiRequest.result.totalScore, munaqasyahRequest.result.totalScore);

  await prisma.munaqasyahFinalResult.upsert({
    where: { studentId_juzId_batch: { studentId, juzId, batch } },
    create: {
      id: randomUUID(),
      studentId,
      groupId,
      juzId,
      batch,
      tasmiResultId: tasmiRequest.result.id,
      munaqasyahResultId: munaqasyahRequest.result.id,
      finalScore,
      finalGrade: scoreToGrade(finalScore),
      passed: finalScore >= 80,
    },
    update: {
      tasmiResultId: tasmiRequest.result.id,
      munaqasyahResultId: munaqasyahRequest.result.id,
      finalScore,
      finalGrade: scoreToGrade(finalScore),
      passed: finalScore >= 80,
    },
  });
}
