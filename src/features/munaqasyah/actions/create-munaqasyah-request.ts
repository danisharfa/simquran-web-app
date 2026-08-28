'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { munaqasyahRequestSchema, type MunaqasyahRequestSchema } from '../munaqasyah.schema';
import { findDuplicateMunaqasyahRequest } from '../check-duplicate-munaqasyah-request';
import { hasPassedTasmi } from '../munaqasyah-follow-up';

export async function createMunaqasyahRequest(input: MunaqasyahRequestSchema) {
  const session = await requireRoleOrThrow(['teacher']);

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

  const duplicate = await findDuplicateMunaqasyahRequest(studentId, { juzId, jenis });
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

  await prisma.munaqasyahRequest.create({
    data: {
      id: randomUUID(),
      studentId,
      groupId,
      teacherId: session.user.id,
      tahap,
      jenis,
      juzId,
    },
  });

  revalidatePath('/dashboard/munaqasyah/request');

  return { success: true, message: 'Permintaan munaqasyah berhasil diajukan' };
}
