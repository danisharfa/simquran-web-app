import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface GroupTableData {
  id: string;
  name: string;
  classroomName: string;
  teacherName: string;
  studentCount: number;
}

export async function listGroups(): Promise<GroupTableData[]> {
  await requireRoleOrThrow(['coordinator']);

  const groups = await prisma.group.findMany({
    where: { isActive: true },
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
