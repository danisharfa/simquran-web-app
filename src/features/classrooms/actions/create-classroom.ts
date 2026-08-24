'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { classroomSchema } from '../classroom.schema';
import type { Semester } from '@/lib/generated/prisma/enums';

export async function createClassroom(formData: FormData) {
  await requireRoleOrThrow(['admin']);

  const parsed = classroomSchema.safeParse({
    level: formData.get('level'),
    name: formData.get('name'),
    academicYear: formData.get('academicYear'),
    semester: formData.get('semester'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
    };
  }

  const { level, name, academicYear, semester } = parsed.data;

  try {
    await prisma.classroom.create({
      data: {
        id: randomUUID(),
        level,
        name,
        academicYear,
        semester: semester as Semester,
      },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return {
        success: false,
        error: 'Kelas dengan nama, tahun ajaran, dan semester tersebut sudah ada',
      };
    }

    console.error('Failed to create classroom:', error);
    return { success: false, error: 'Gagal membuat kelas' };
  }

  revalidatePath('/dashboard/classrooms');

  return { success: true };
}
