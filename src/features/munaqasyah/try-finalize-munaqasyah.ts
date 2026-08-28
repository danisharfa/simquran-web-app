import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { calculateFinalScore, scoreToGrade, isPassing } from './munaqasyah-scoring';
import { getMunaqasyahGradeSettings } from './queries/get-munaqasyah-grade-settings';
import { getFinalScoreWeights } from './queries/get-final-score-weights';
import type { MunaqasyahTahap } from '@/lib/generated/prisma/enums';

/**
 * Dipanggil setiap kali satu hasil (Tasmi atau Munaqasyah) tersimpan.
 * Kalau pasangannya (jenis lain, siswa+juz+tahap+kelompok sama, sudah SELESAI) juga sudah ada,
 * gabungkan jadi MunaqasyahFinalResult memakai bobot dari MunaqasyahFinalScoreWeightSetting
 * (default 70% Tasmi + 30% Munaqasyah, diatur superadmin di Pengaturan Penilaian).
 */
export async function tryFinalizeMunaqasyah(
  studentId: string,
  groupId: string,
  juzId: number,
  tahap: MunaqasyahTahap,
) {
  const [tasmiRequest, munaqasyahRequest] = await Promise.all([
    prisma.munaqasyahRequest.findFirst({
      where: { studentId, groupId, juzId, tahap, jenis: 'TASMI', status: 'SELESAI' },
      include: { result: true },
    }),
    prisma.munaqasyahRequest.findFirst({
      where: { studentId, groupId, juzId, tahap, jenis: 'MUNAQASYAH', status: 'SELESAI' },
      include: { result: true },
    }),
  ]);

  if (!tasmiRequest?.result || !munaqasyahRequest?.result) return;

  const [gradeSettings, finalScoreWeights] = await Promise.all([getMunaqasyahGradeSettings(), getFinalScoreWeights()]);
  const finalScore = calculateFinalScore(
    tasmiRequest.result.totalScore,
    munaqasyahRequest.result.totalScore,
    finalScoreWeights,
  );
  const finalGrade = scoreToGrade(finalScore, gradeSettings);

  await prisma.munaqasyahFinalResult.upsert({
    where: { studentId_juzId_tahap: { studentId, juzId, tahap } },
    create: {
      id: randomUUID(),
      studentId,
      groupId,
      juzId,
      tahap,
      tasmiResultId: tasmiRequest.result.id,
      munaqasyahResultId: munaqasyahRequest.result.id,
      finalScore,
      finalGrade,
      passed: isPassing(finalGrade),
    },
    update: {
      tasmiResultId: tasmiRequest.result.id,
      munaqasyahResultId: munaqasyahRequest.result.id,
      finalScore,
      finalGrade,
      passed: isPassing(finalGrade),
    },
  });
}
