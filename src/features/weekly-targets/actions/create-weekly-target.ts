'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { createWeeklyTargetSchema, type CreateWeeklyTargetInput } from '../weekly-target.schema';

export async function createWeeklyTarget(input: CreateWeeklyTargetInput) {
  const session = await requireRoleOrThrow(['teacher']);

  const parsed = createWeeklyTargetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }

  const { groupId, studentIds, startDate, endDate, ...rest } = parsed.data;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  const validStudents = await prisma.studentProfile.findMany({
    where: { userId: { in: studentIds }, groupId },
    select: { userId: true },
  });

  if (validStudents.length === 0) {
    return { success: false, message: 'Tidak ada siswa valid di kelompok ini' };
  }

  await prisma.weeklyTarget.createMany({
    data: validStudents.map((student) => ({
      id: randomUUID(),
      studentId: student.userId,
      teacherId: session.user.id,
      groupId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ...rest,
    })),
  });

  revalidatePath('/dashboard/weekly-target');

  return { success: true, message: 'Target mingguan berhasil dibuat' };
}
