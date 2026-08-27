'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tahfidzScoreSchema, type TahfidzScoreSchema } from '../score.schema';
import { computeGrade, generateTahfidzDescription } from '../grade';
import { recalculateReport } from '../recalculate-report';

export async function upsertTahfidzScore(input: TahfidzScoreSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = tahfidzScoreSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { studentId, groupId, surahId, score } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  const surah = await prisma.surah.findUnique({ where: { id: surahId } });
  if (!surah) {
    return { success: false, message: 'Surah tidak valid' };
  }

  const grade = computeGrade(score);
  const description = generateTahfidzDescription(grade, surah.name);

  await prisma.tahfidzScore.upsert({
    where: { studentId_groupId_surahId: { studentId, groupId, surahId } },
    create: { studentId, groupId, surahId, score, grade, description },
    update: { score, grade, description },
  });

  await recalculateReport(studentId, groupId);

  revalidatePath(`/dashboard/group/${groupId}/student/${studentId}/report`);

  return { success: true, message: 'Nilai tahfidz berhasil disimpan' };
}
