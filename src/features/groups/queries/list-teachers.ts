import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface TeacherOption {
  userId: string;
  name: string;
}

export async function listTeachers(): Promise<TeacherOption[]> {
  await requireRoleOrThrow(['coordinator']);

  const teachers = await prisma.teacherProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });

  return teachers.map((teacher) => ({
    userId: teacher.userId,
    name: teacher.user.name,
  }));
}
