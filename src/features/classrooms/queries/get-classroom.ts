import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface ClassroomDetail {
  id: string;
  level: number;
  name: string;
  academicYear: string;
  semester: 'GANJIL' | 'GENAP';
  isActive: boolean;
}

export async function getClassroom(classroomId: string): Promise<ClassroomDetail> {
  await requireRoleOrThrow(['admin']);

  const classroom = await prisma.classroom.findUniqueOrThrow({
    where: { id: classroomId },
  });

  return {
    id: classroom.id,
    level: classroom.level,
    name: classroom.name,
    academicYear: classroom.academicYear,
    semester: classroom.semester,
    isActive: classroom.isActive,
  };
}
