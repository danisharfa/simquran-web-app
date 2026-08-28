'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tahsinScoreSchema, type TahsinScoreSchema } from '../score.schema';
import { computeGrade, generateTahsinDescription, buildGradeDescriptionMap } from '../grade';
import { recalculateReport } from '../recalculate-report';
import { getGradeLetterSettings } from '../queries/get-grade-letter-settings';
import { getReportTemplates } from '../queries/get-report-templates';

export async function upsertTahsinScore(input: TahsinScoreSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = tahsinScoreSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { studentId, groupId, tahsinType, topic, score } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  const [gradeSettings, templates] = await Promise.all([getGradeLetterSettings(), getReportTemplates()]);
  const grade = computeGrade(score, gradeSettings);
  const description = generateTahsinDescription(
    grade,
    topic,
    templates.TAHSIN,
    buildGradeDescriptionMap(gradeSettings),
  );

  await prisma.tahsinScore.upsert({
    where: { studentId_groupId_tahsinType_topic: { studentId, groupId, tahsinType, topic } },
    create: { studentId, groupId, tahsinType, topic, score, grade, description },
    update: { score, grade, description },
  });

  await recalculateReport(studentId, groupId);

  revalidatePath(`/dashboard/group/${groupId}/student/${studentId}/report`);

  return { success: true, message: 'Nilai tahsin berhasil disimpan' };
}
