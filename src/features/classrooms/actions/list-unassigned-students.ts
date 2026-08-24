'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { StudentOption } from './list-classroom-students';

export async function listUnassignedStudents(): Promise<StudentOption[]> {
  await requireRoleOrThrow(['admin']);

  const students = await prisma.studentProfile.findMany({
    where: { classroomId: null },
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });

  return students.map((student) => ({
    userId: student.userId,
    nis: student.nis,
    name: student.user.name,
  }));
}
