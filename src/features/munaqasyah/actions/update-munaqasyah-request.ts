'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { munaqasyahRequestSchema, type MunaqasyahRequestSchema } from '../munaqasyah.schema';

export async function updateMunaqasyahRequest(requestId: string, input: MunaqasyahRequestSchema) {
  const session = await requireRoleOrThrow(['teacher']);

  const existing = await prisma.munaqasyahRequest.findUnique({ where: { id: requestId } });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Permintaan tidak ditemukan' };
  }
  if (existing.status !== 'MENUNGGU' && existing.status !== 'DITOLAK') {
    return { success: false, message: 'Permintaan hanya dapat diedit saat berstatus menunggu atau ditolak' };
  }

  const parsed = munaqasyahRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { groupId, studentId, batch, stage, juzId } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  await prisma.munaqasyahRequest.update({
    where: { id: requestId },
    data: { studentId, groupId, batch, stage, juzId },
  });

  revalidatePath('/dashboard/munaqasyah/request');

  return { success: true, message: 'Permintaan munaqasyah berhasil diperbarui' };
}
