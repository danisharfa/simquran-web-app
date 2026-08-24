'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import {
  calculateMunaqasyahTotalScore,
  scoreToGrade,
  validateMunaqasyahDetails,
  type MunaqasyahDetailInput,
} from '../munaqasyah-scoring';
import { tryFinalizeMunaqasyah } from '../try-finalize-munaqasyah';

export async function submitMunaqasyahResult(requestId: string, rows: MunaqasyahDetailInput[]) {
  const session = await requireRoleOrThrow(['teacher', 'coordinator']);
  const role = session.user.role.toLowerCase();

  const validationError = validateMunaqasyahDetails(rows);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const request = await prisma.munaqasyahRequest.findUnique({ where: { id: requestId } });
  if (!request || request.stage !== 'MUNAQASYAH' || request.status !== 'DITERIMA') {
    return { success: false, message: 'Permintaan tidak valid untuk dinilai' };
  }

  const scheduleRequest = await prisma.munaqasyahScheduleRequest.findFirst({
    where: { requestId },
    include: { schedule: true },
  });
  if (!scheduleRequest) {
    return { success: false, message: 'Permintaan ini belum dijadwalkan' };
  }

  if (role === 'teacher' && scheduleRequest.schedule.examinerId !== session.user.id) {
    return { success: false, message: 'Anda bukan penguji untuk jadwal ini' };
  }

  const { totalScore, detailsToSave } = calculateMunaqasyahTotalScore(rows);
  const resultId = randomUUID();

  await prisma.$transaction([
    prisma.munaqasyahResult.create({
      data: {
        id: resultId,
        requestId,
        scheduleId: scheduleRequest.scheduleId,
        totalScore,
        grade: scoreToGrade(totalScore),
        passed: totalScore >= 80,
      },
    }),
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
    prisma.munaqasyahRequest.update({ where: { id: requestId }, data: { status: 'SELESAI' } }),
  ]);

  await tryFinalizeMunaqasyah(request.studentId, request.groupId, request.juzId, request.batch);

  revalidatePath('/dashboard/munaqasyah/assessment');
  revalidatePath('/dashboard/munaqasyah/results');

  return { success: true, message: 'Hasil Munaqasyah berhasil disimpan' };
}
