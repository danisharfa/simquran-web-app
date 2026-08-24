import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { GroupTableData } from './list-groups';

export async function listMyGroups(): Promise<GroupTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const groups = await prisma.group.findMany({
    where: { isActive: true, teacherId: session.user.id },
    include: {
      classroom: true,
      teacher: { include: { user: true } },
      _count: { select: { students: true } },
    },
    orderBy: { name: 'asc' },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    classroomName: `${group.classroom.level} ${group.classroom.name}`,
    teacherName: group.teacher.user.name,
    studentCount: group._count.students,
  }));
}
