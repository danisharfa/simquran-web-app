'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function updateLastTahsinMaterial(studentId: string, groupId: string, material: string) {
  const session = await requireRoleOrThrow(['teacher']);

  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { classroom: true } });
  if (!group || group.teacherId !== session.user.id) {
    return { success: false, message: 'Kelompok tidak valid' };
  }

  await prisma.report.upsert({
    where: {
      studentId_academicYear_semester: {
        studentId,
        academicYear: group.classroom.academicYear,
        semester: group.classroom.semester,
      },
    },
    create: {
      studentId,
      groupId,
      academicYear: group.classroom.academicYear,
      semester: group.classroom.semester,
      lastTahsinMaterial: material,
    },
    update: { groupId, lastTahsinMaterial: material },
  });

  revalidatePath(`/dashboard/group/${groupId}/student/${studentId}/report`);

  return { success: true, message: 'Materi tahsin terakhir berhasil disimpan' };
}
