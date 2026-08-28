import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { StudentStatus } from '@/lib/generated/prisma/enums';

export interface ExitedStudentOption {
  userId: string;
  nis: string;
  username: string;
  name: string;
  status: StudentStatus;
  exitedAt: Date | null;
}

export async function listExitedStudents(): Promise<ExitedStudentOption[]> {
  await requireRoleOrThrow(['admin']);

  const students = await prisma.studentProfile.findMany({
    where: { status: { in: ['PINDAH', 'KELUAR'] } },
    include: { user: true },
    orderBy: { exitedAt: 'desc' },
  });

  return students.map((student) => ({
    userId: student.userId,
    nis: student.nis,
    username: student.user.username,
    name: student.user.name,
    status: student.status,
    exitedAt: student.exitedAt,
  }));
}
