import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface GroupStudentOption {
  userId: string;
  nis: string;
  name: string;
}

export async function listGroupStudents(groupId: string): Promise<GroupStudentOption[]> {
  const session = await requireRoleOrThrow(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();

  if (role === 'teacher') {
    const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId } });
    if (group.teacherId !== session.user.id) {
      throw new Error('Forbidden: tidak memiliki akses ke kelompok ini');
    }
  }

  const students = await prisma.studentProfile.findMany({
    where: { groupId },
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });

  return students.map((student) => ({
    userId: student.userId,
    nis: student.nis,
    name: student.user.name,
  }));
}
