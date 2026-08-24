'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { ClassroomTableData } from './list-classrooms';

export async function listClassroomHistory(): Promise<ClassroomTableData[]> {
  await requireRoleOrThrow(['admin']);

  const classrooms = await prisma.classroom.findMany({
    where: { isActive: false },
    include: { _count: { select: { classroomHistories: true } } },
    orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }, { level: 'asc' }],
  });

  return classrooms.map((classroom) => ({
    id: classroom.id,
    level: classroom.level,
    name: classroom.name,
    academicYear: classroom.academicYear,
    semester: classroom.semester,
    studentCount: classroom._count.classroomHistories,
  }));
}
