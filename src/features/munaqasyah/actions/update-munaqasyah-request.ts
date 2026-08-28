'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { munaqasyahRequestSchema, type MunaqasyahRequestSchema } from '../munaqasyah.schema';
import { findDuplicateMunaqasyahRequest } from '../check-duplicate-munaqasyah-request';
import { hasPassedTasmi } from '../munaqasyah-follow-up';

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

  const { groupId, studentId, tahap, jenis, juzId } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
  if (!student || student.groupId !== groupId) {
    return { success: false, message: 'Siswa bukan anggota kelompok ini' };
  }

  const duplicate = await findDuplicateMunaqasyahRequest(studentId, { juzId, jenis }, requestId);
  if (duplicate) {
    return {
      success: false,
      message:
        duplicate.status === 'SELESAI'
          ? 'Siswa sudah lulus untuk juz dan jenis ujian ini (di tahap manapun), tidak perlu diajukan lagi'
          : 'Siswa sudah memiliki permintaan munaqasyah yang sama dan masih diproses (di tahap manapun)',
    };
  }

  if (jenis === 'MUNAQASYAH' && !(await hasPassedTasmi(studentId, juzId))) {
    return {
      success: false,
      message: 'Siswa belum lulus Tasmi untuk juz ini, tidak bisa didaftarkan langsung ke Munaqasyah',
    };
  }

  await prisma.munaqasyahRequest.update({
    where: { id: requestId },
    data: { studentId, groupId, tahap, jenis, juzId },
  });

  revalidatePath('/dashboard/munaqasyah/request');

  return { success: true, message: 'Permintaan munaqasyah berhasil diperbarui' };
}
