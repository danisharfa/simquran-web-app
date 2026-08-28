'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { recordClassroomExitHistory } from '../lib/record-classroom-exit-history';

export async function removeStudentFromClassroom(classroomId: string, studentId: string) {
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
      data: { classroomId: null, groupId: null },
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

  revalidatePath(`/dashboard/classrooms/${classroomId}`);
  revalidatePath('/dashboard/classrooms');
  revalidatePath('/dashboard/group');

  return {
    success: true,
    message: student.groupId
      ? 'Siswa berhasil dihapus dari kelas beserta kelompoknya'
      : 'Siswa berhasil dihapus dari kelas',
  };
}
