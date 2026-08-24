import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface StudentOption {
  userId: string;
  nis: string;
  name: string;
}

export async function listClassroomStudents(classroomId: string): Promise<StudentOption[]> {
  await requireRoleOrThrow(['admin']);

  const students = await prisma.studentProfile.findMany({
    where: { classroomId },
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });

  return students.map((student) => ({
    userId: student.userId,
    nis: student.nis,
    name: student.user.name,
  }));
}
