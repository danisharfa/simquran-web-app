'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { Semester } from '@/lib/generated/prisma/enums';

export async function promoteClassroom(
  classroomId: string,
  studentIds: string[],
  targetAcademicYear: string,
  targetSemester: Semester,
) {
  await requireRoleOrThrow(['admin']);

  if (studentIds.length === 0) {
    return { success: false, message: 'Pilih minimal satu siswa' };
  }

  const classroom = await prisma.classroom.findUniqueOrThrow({ where: { id: classroomId } });
  const isGraduating = classroom.level >= 6;

  // siswa non-lulus dipindah ke kelas level berikutnya di tahun/semester tujuan
  let targetClassroomId: string | null = null;
  if (!isGraduating) {
    if (!targetAcademicYear) {
      return { success: false, message: 'Tahun ajaran tujuan wajib diisi' };
    }

    const existing = await prisma.classroom.findFirst({
      where: {
        level: classroom.level + 1,
        name: classroom.name,
        academicYear: targetAcademicYear,
        semester: targetSemester,
      },
    });

    targetClassroomId = existing?.id ?? randomUUID();
    if (!existing) {
      await prisma.classroom.create({
        data: {
          id: targetClassroomId,
          level: classroom.level + 1,
          name: classroom.name,
          academicYear: targetAcademicYear,
          semester: targetSemester,
        },
      });
    }
  }

  for (const studentId of studentIds) {
    await prisma.classroomHistory.upsert({
      where: {
        studentId_academicYear_semester: {
          studentId,
          academicYear: classroom.academicYear,
          semester: classroom.semester,
        },
      },
      create: {
        id: randomUUID(),
        studentId,
        classroomId,
        academicYear: classroom.academicYear,
        semester: classroom.semester,
      },
      update: {},
    });

    if (isGraduating) {
      await prisma.studentProfile.update({
        where: { userId: studentId },
        data: { status: 'LULUS', graduatedAt: new Date(), classroomId: null },
      });
    } else {
      await prisma.studentProfile.update({
        where: { userId: studentId },
        data: { classroomId: targetClassroomId },
      });
    }
  }

  const remaining = await prisma.studentProfile.count({ where: { classroomId } });
  if (remaining === 0) {
    await prisma.classroom.update({ where: { id: classroomId }, data: { isActive: false } });
  }

  revalidatePath('/dashboard/classrooms');
  revalidatePath(`/dashboard/classrooms/${classroomId}`);

  return {
    success: true,
    message: isGraduating ? 'Siswa berhasil diluluskan' : 'Siswa berhasil naik kelas',
  };
}
