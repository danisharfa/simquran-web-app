'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function promoteGroup(groupId: string) {
  await requireRoleOrThrow(['coordinator']);

  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: { classroom: true, students: true },
  });

  if (group.students.length === 0) {
    return { success: false, message: 'Kelompok ini tidak memiliki anggota' };
  }

  for (const student of group.students) {
    await prisma.groupHistory.upsert({
      where: {
        studentId_academicYear_semester: {
          studentId: student.userId,
          academicYear: group.classroom.academicYear,
          semester: group.classroom.semester,
        },
      },
      create: {
        id: randomUUID(),
        studentId: student.userId,
        groupId,
        academicYear: group.classroom.academicYear,
        semester: group.classroom.semester,
      },
      update: {},
    });
  }

  await prisma.studentProfile.updateMany({
    where: { groupId },
    data: { groupId: null },
  });

  await prisma.group.update({ where: { id: groupId }, data: { isActive: false } });

  revalidatePath('/dashboard/group');
  revalidatePath(`/dashboard/group/${groupId}`);

  return {
    success: true,
    message: 'Kelompok berhasil diarsipkan, anggota dibebaskan untuk kelompok baru',
  };
}
