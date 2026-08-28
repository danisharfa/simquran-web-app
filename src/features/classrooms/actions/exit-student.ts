'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { recordClassroomExitHistory } from '../lib/record-classroom-exit-history';

type ExitStatus = 'PINDAH' | 'KELUAR';

const STATUS_LABEL: Record<ExitStatus, string> = {
  PINDAH: 'Pindah sekolah',
  KELUAR: 'Keluar sekolah',
};

export async function exitStudent(classroomId: string, studentId: string, status: ExitStatus) {
  await requireRoleOrThrow(['admin']);

  const classroom = await prisma.classroom.findUniqueOrThrow({ where: { id: classroomId } });
  const student = await prisma.studentProfile.findUniqueOrThrow({
    where: { userId: studentId },
    select: { groupId: true },
  });

  await prisma.$transaction(async (tx) => {
    await recordClassroomExitHistory({
      tx,
      studentId,
      classroomId,
      groupId: student.groupId,
      academicYear: classroom.academicYear,
      semester: classroom.semester,
    });

    await tx.studentProfile.update({
      where: { userId: studentId },
      data: { classroomId: null, groupId: null, status, exitedAt: new Date() },
    });
  });

  if (student.groupId) {
    const remainingInGroup = await prisma.studentProfile.count({
      where: { groupId: student.groupId },
    });
    if (remainingInGroup === 0) {
      await prisma.group.update({ where: { id: student.groupId }, data: { isActive: false } });
    }
  }

  const remainingInClassroom = await prisma.studentProfile.count({ where: { classroomId } });
  if (remainingInClassroom === 0) {
    await prisma.classroom.update({ where: { id: classroomId }, data: { isActive: false } });
  }

  await auth.api.banUser({
    body: { userId: studentId, banReason: STATUS_LABEL[status] },
    headers: await headers(),
  });

  revalidatePath(`/dashboard/classrooms/${classroomId}`);
  revalidatePath('/dashboard/classrooms');
  revalidatePath('/dashboard/group');
  revalidatePath('/dashboard/users');

  return {
    success: true,
    message: `Siswa berhasil ditandai ${STATUS_LABEL[status].toLowerCase()}`,
  };
}
