'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { munaqasyahRequestSchema, type MunaqasyahRequestSchema } from '../munaqasyah.schema';

export async function createMunaqasyahRequest(input: MunaqasyahRequestSchema) {
  const session = await requireRoleOrThrow(['teacher']);

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

  await prisma.munaqasyahRequest.create({
    data: {
      id: randomUUID(),
      studentId,
      groupId,
      teacherId: session.user.id,
      batch,
      stage,
      juzId,
    },
  });

  revalidatePath('/dashboard/munaqasyah/request');

  return { success: true, message: 'Permintaan munaqasyah berhasil diajukan' };
}
