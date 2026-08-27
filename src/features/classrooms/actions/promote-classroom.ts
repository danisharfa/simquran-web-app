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

  const students = await prisma.studentProfile.findMany({
    where: { userId: { in: studentIds } },
    select: { userId: true, groupId: true },
  });
  const affectedGroupIds = new Set<string>();

  for (const student of students) {
    await prisma.classroomHistory.upsert({
      where: {
        studentId_academicYear_semester: {
          studentId: student.userId,
          academicYear: classroom.academicYear,
          semester: classroom.semester,
        },
      },
      create: {
        id: randomUUID(),
        studentId: student.userId,
        classroomId,
        academicYear: classroom.academicYear,
        semester: classroom.semester,
      },
      update: {},
    });

    // naik kelas melepaskan siswa dari kelompok lama; kelompok lama otomatis jadi riwayat
    if (student.groupId) {
      affectedGroupIds.add(student.groupId);

      await prisma.groupHistory.upsert({
        where: {
          studentId_academicYear_semester: {
            studentId: student.userId,
            academicYear: classroom.academicYear,
            semester: classroom.semester,
          },
        },
        create: {
          id: randomUUID(),
          studentId: student.userId,
          groupId: student.groupId,
          academicYear: classroom.academicYear,
          semester: classroom.semester,
        },
        update: {},
      });
    }

    if (isGraduating) {
      await prisma.studentProfile.update({
        where: { userId: student.userId },
        data: { status: 'LULUS', graduatedAt: new Date(), classroomId: null, groupId: null },
      });
    } else {
      await prisma.studentProfile.update({
        where: { userId: student.userId },
        data: { classroomId: targetClassroomId, groupId: null },
      });
    }
  }

  const remaining = await prisma.studentProfile.count({ where: { classroomId } });
  if (remaining === 0) {
    await prisma.classroom.update({ where: { id: classroomId }, data: { isActive: false } });
  }

  for (const groupId of affectedGroupIds) {
    const remainingInGroup = await prisma.studentProfile.count({ where: { groupId } });
    if (remainingInGroup === 0) {
      await prisma.group.update({ where: { id: groupId }, data: { isActive: false } });
    }
  }

  revalidatePath('/dashboard/classrooms');
  revalidatePath(`/dashboard/classrooms/${classroomId}`);
  revalidatePath('/dashboard/group');

  return {
    success: true,
    message: isGraduating ? 'Siswa berhasil diluluskan' : 'Siswa berhasil naik kelas',
  };
}
