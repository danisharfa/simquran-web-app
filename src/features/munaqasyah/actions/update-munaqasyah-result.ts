'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import {
  calculateMunaqasyahTotalScore,
  scoreToGrade,
  isPassing,
  validateMunaqasyahDetails,
  type MunaqasyahDetailInput,
} from '../munaqasyah-scoring';
import { tryFinalizeMunaqasyah } from '../try-finalize-munaqasyah';
import { getScoringWeights } from '../queries/get-scoring-weights';
import { getMunaqasyahGradeSettings } from '../queries/get-munaqasyah-grade-settings';

export async function updateMunaqasyahResult(resultId: string, rows: MunaqasyahDetailInput[]) {
  await requireRoleOrThrow(['coordinator']);

  const validationError = validateMunaqasyahDetails(rows);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const result = await prisma.munaqasyahResult.findUnique({ where: { id: resultId }, include: { request: true } });
  if (!result || result.request.jenis !== 'MUNAQASYAH') {
    return { success: false, message: 'Hasil Munaqasyah tidak ditemukan' };
  }
  const { request } = result;

  const [weights, gradeSettings] = await Promise.all([
    getScoringWeights('MUNAQASYAH'),
    getMunaqasyahGradeSettings(),
  ]);
  const { totalScore, detailsToSave } = calculateMunaqasyahTotalScore(rows, weights);
  const grade = scoreToGrade(totalScore, gradeSettings);
  const passed = isPassing(grade);

  await prisma.$transaction([
    prisma.munaqasyahResult.update({ where: { id: resultId }, data: { totalScore, grade, passed } }),
    prisma.munaqasyahDetail.deleteMany({ where: { resultId } }),
    prisma.munaqasyahDetail.createMany({
      data: detailsToSave.map((d) => ({
        id: randomUUID(),
        resultId,
        questionNo: d.questionNo,
        initialScore: d.initialScore,
        khofiAwalAyat: d.khofiAwalAyat,
        khofiMakhroj: d.khofiMakhroj,
        khofiTajwidMad: d.khofiTajwidMad,
        jaliBaris: d.jaliBaris,
        jaliLebihSatuKalimat: d.jaliLebihSatuKalimat,
        totalScore: d.totalScore,
        note: d.note ?? null,
      })),
    }),
  ]);

  await tryFinalizeMunaqasyah(request.studentId, request.groupId, request.juzId, request.tahap);

  revalidatePath('/dashboard/munaqasyah/assessment');
  revalidatePath('/dashboard/munaqasyah/results');

  return { success: true, message: 'Hasil Munaqasyah berhasil diperbarui' };
}
