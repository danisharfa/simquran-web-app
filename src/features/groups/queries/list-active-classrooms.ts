import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface ClassroomOption {
  id: string;
  level: number;
  name: string;
}

export async function listActiveClassrooms(): Promise<ClassroomOption[]> {
  await requireRoleOrThrow(['coordinator']);

  const classrooms = await prisma.classroom.findMany({
    where: { isActive: true },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  });

  return classrooms.map((classroom) => ({
    id: classroom.id,
    level: classroom.level,
    name: classroom.name,
  }));
}
