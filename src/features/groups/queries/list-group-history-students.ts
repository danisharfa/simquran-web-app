import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { GroupStudentOption } from './list-group-students';

// kelompok nonaktif tidak lagi menautkan siswa via studentProfile.groupId
// (dilepas saat naik kelas), sehingga daftar siswanya diambil dari GroupHistory
export async function listGroupHistoryStudents(groupId: string): Promise<GroupStudentOption[]> {
  const session = await requireRoleOrThrow(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();

  if (role === 'teacher') {
    const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId } });
    if (group.teacherId !== session.user.id) {
      throw new Error('Forbidden: tidak memiliki akses ke kelompok ini');
    }
  }

  const histories = await prisma.groupHistory.findMany({
    where: { groupId },
    include: { student: { include: { user: true } } },
  });

  const uniqueByStudent = new Map<string, GroupStudentOption>();
  for (const history of histories) {
    if (!uniqueByStudent.has(history.studentId)) {
      uniqueByStudent.set(history.studentId, {
        userId: history.student.userId,
        nis: history.student.nis,
        name: history.student.user.name,
      });
    }
  }

  return Array.from(uniqueByStudent.values()).sort((a, b) => a.name.localeCompare(b.name));
}
