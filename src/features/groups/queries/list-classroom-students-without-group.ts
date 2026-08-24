import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { GroupStudentOption } from './list-group-students';

export async function listClassroomStudentsWithoutGroup(
  classroomId: string,
): Promise<GroupStudentOption[]> {
  await requireRoleOrThrow(['coordinator']);

  const students = await prisma.studentProfile.findMany({
    where: { classroomId, groupId: null },
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });

  return students.map((student) => ({
    userId: student.userId,
    nis: student.nis,
    name: student.user.name,
  }));
}
