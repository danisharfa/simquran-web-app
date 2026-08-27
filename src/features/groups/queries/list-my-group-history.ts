import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { GroupTableData } from './list-groups';

export async function listMyGroupHistory(): Promise<GroupTableData[]> {
  const session = await requireRoleOrThrow(['teacher']);

  const groups = await prisma.group.findMany({
    where: { isActive: false, teacherId: session.user.id },
    include: {
      classroom: true,
      teacher: { include: { user: true } },
      _count: { select: { groupHistories: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    classroomName: `${group.classroom.level} ${group.classroom.name}`,
    teacherName: group.teacher.user.name,
    studentCount: group._count.groupHistories,
  }));
}
