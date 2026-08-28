'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function removeStudentFromGroup(groupId: string, studentId: string) {
  await requireRoleOrThrow(['coordinator']);

  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: { classroom: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.groupHistory.upsert({
      where: {
        studentId_academicYear_semester: {
          studentId,
          academicYear: group.classroom.academicYear,
          semester: group.classroom.semester,
        },
      },
      create: {
        id: randomUUID(),
        studentId,
        groupId,
        academicYear: group.classroom.academicYear,
        semester: group.classroom.semester,
      },
      update: {},
    });

    await tx.studentProfile.update({
      where: { userId: studentId },
      data: { groupId: null },
    });
  });

  const remainingInGroup = await prisma.studentProfile.count({ where: { groupId } });
  if (remainingInGroup === 0) {
    await prisma.group.update({ where: { id: groupId }, data: { isActive: false } });
  }

  revalidatePath(`/dashboard/group/${groupId}`);
  revalidatePath('/dashboard/group');

  return { success: true, message: 'Siswa berhasil dihapus dari kelompok' };
}
