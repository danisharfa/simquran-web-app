'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tashihRequestSchema, type TashihRequestSchema } from '../tashih.schema';
import { validateTashihCoverage } from '../validate-tashih-coverage';

export async function createTashihRequest(input: TashihRequestSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = tashihRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { groupId, studentId, ...rest } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  const coverage = await validateTashihCoverage(studentId, rest);
  if (!coverage.valid) {
    return { success: false, message: coverage.message };
  }

  await prisma.tashihRequest.create({
    data: {
      id: randomUUID(),
      studentId,
      groupId,
      teacherId: session.user.id,
      ...rest,
    },
  });

  revalidatePath('/dashboard/tashih/request');

  return { success: true, message: 'Permintaan tashih berhasil diajukan' };
}
