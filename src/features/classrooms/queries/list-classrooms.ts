import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface ClassroomTableData {
  id: string;
  level: number;
  name: string;
  academicYear: string;
  semester: 'GANJIL' | 'GENAP';
  studentCount: number;
}

export async function listClassrooms(): Promise<ClassroomTableData[]> {
  await requireRoleOrThrow(['admin']);

  const classrooms = await prisma.classroom.findMany({
    where: { isActive: true },
    include: { _count: { select: { students: true } } },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  });

  return classrooms.map((classroom) => ({
    id: classroom.id,
    level: classroom.level,
    name: classroom.name,
    academicYear: classroom.academicYear,
    semester: classroom.semester,
    studentCount: classroom._count.students,
  }));
}
