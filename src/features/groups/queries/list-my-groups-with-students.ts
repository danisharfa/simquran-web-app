import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface GroupWithStudents {
  id: string;
  name: string;
  students: { userId: string; name: string; nis: string }[];
}

export async function listMyGroupsWithStudents(): Promise<GroupWithStudents[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const groups = await prisma.group.findMany({
    where: { isActive: true, teacherId: session.user.id },
    include: { students: { include: { user: true }, orderBy: { user: { name: 'asc' } } } },
    orderBy: { name: 'asc' },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    students: group.students.map((student) => ({
      userId: student.userId,
      name: student.user.name,
      nis: student.nis,
    })),
  }));
}
