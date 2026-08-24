'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tahsinScoreSchema, type TahsinScoreSchema } from '../score.schema';
import { computeGrade } from '../grade';
import { recalculateReport } from '../recalculate-report';

export async function upsertTahsinScore(input: TahsinScoreSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = tahsinScoreSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { studentId, groupId, tahsinType, topic, score, description } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  await prisma.tahsinScore.upsert({
    where: { studentId_groupId_tahsinType_topic: { studentId, groupId, tahsinType, topic } },
    create: { studentId, groupId, tahsinType, topic, score, grade: computeGrade(score), description },
    update: { score, grade: computeGrade(score), description },
  });

  await recalculateReport(studentId, groupId);

  revalidatePath(`/dashboard/group/${groupId}/student/${studentId}/score`);
  revalidatePath(`/dashboard/group/${groupId}/student/${studentId}/report`);

  return { success: true, message: 'Nilai tahsin berhasil disimpan' };
}
