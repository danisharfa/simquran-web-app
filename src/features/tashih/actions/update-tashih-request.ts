'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { tashihRequestSchema, type TashihRequestSchema } from '../tashih.schema';
import { validateTashihCoverage } from '../validate-tashih-coverage';

export async function updateTashihRequest(requestId: string, input: TashihRequestSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const existing = await prisma.tashihRequest.findUnique({ where: { id: requestId } });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Permintaan tidak ditemukan' };
  }
  if (existing.status !== 'MENUNGGU' && existing.status !== 'DITOLAK') {
    return { success: false, message: 'Permintaan hanya dapat diedit saat berstatus menunggu atau ditolak' };
  }

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

  await prisma.tashihRequest.update({
    where: { id: requestId },
    data: { studentId, groupId, ...rest },
  });

  revalidatePath('/dashboard/tashih/request');

  return { success: true, message: 'Permintaan tashih berhasil diperbarui' };
}
