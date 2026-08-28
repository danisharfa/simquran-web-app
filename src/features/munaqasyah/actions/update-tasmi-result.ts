'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import {
  calculateTasmiTotalScore,
  scoreToGrade,
  isPassing,
  validateTasmiDetails,
  type TasmiDetailInput,
} from '../munaqasyah-scoring';
import { tryFinalizeMunaqasyah } from '../try-finalize-munaqasyah';
import { getScoringWeights } from '../queries/get-scoring-weights';
import { getMunaqasyahGradeSettings } from '../queries/get-munaqasyah-grade-settings';
import {
  assertTasmiResultEditable,
  findActiveMunaqasyahFollowUp,
  syncMunaqasyahFollowUpAfterTasmiChange,
} from '../munaqasyah-follow-up';

export async function updateTasmiResult(resultId: string, rows: TasmiDetailInput[]) {
  await requireRoleOrThrow(['coordinator']);

  const validationError = validateTasmiDetails(rows);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const result = await prisma.munaqasyahResult.findUnique({ where: { id: resultId }, include: { request: true } });
  if (!result || result.request.jenis !== 'TASMI') {
    return { success: false, message: 'Hasil Tasmi tidak ditemukan' };
  }
  const { request } = result;

  const followUp = await findActiveMunaqasyahFollowUp(request.studentId, request.juzId);
  const blockedMessage = assertTasmiResultEditable(followUp);
  if (blockedMessage) {
    return { success: false, message: blockedMessage };
  }

  const [weights, gradeSettings] = await Promise.all([getScoringWeights('TASMI'), getMunaqasyahGradeSettings()]);
  const { totalScore, detailsToSave } = calculateTasmiTotalScore(rows, weights);
  const grade = scoreToGrade(totalScore, gradeSettings);
  const passed = isPassing(grade);

  await prisma.$transaction([
    prisma.munaqasyahResult.update({ where: { id: resultId }, data: { totalScore, grade, passed } }),
    prisma.tasmiDetail.deleteMany({ where: { resultId } }),
    prisma.tasmiDetail.createMany({
      data: detailsToSave.map((d) => ({
        id: randomUUID(),
        resultId,
        surahId: d.surahId,
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
  await syncMunaqasyahFollowUpAfterTasmiChange(request, passed);

  revalidatePath('/dashboard/munaqasyah/assessment');
  revalidatePath('/dashboard/munaqasyah/results');

  return { success: true, message: 'Hasil Tasmi berhasil diperbarui' };
}
