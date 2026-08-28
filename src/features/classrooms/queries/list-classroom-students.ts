import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface StudentOption {
  userId: string;
  nis: string;
  name: string;
  groupName: string | null;
}

export async function listClassroomStudents(classroomId: string): Promise<StudentOption[]> {
  await requireRoleOrThrow(['admin']);

  const students = await prisma.studentProfile.findMany({
    where: { classroomId },
    include: { user: true, group: true },
    orderBy: { nis: 'asc' },
  });

  return students.map((student) => ({
    userId: student.userId,
    nis: student.nis,
    name: student.user.name,
    groupName: student.group?.name ?? null,
  }));
}
