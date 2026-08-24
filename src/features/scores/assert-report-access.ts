import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

/**
 * Guru hanya boleh akses nilai/rapor kelompok bimbingannya sendiri;
 * siswa hanya boleh akses miliknya sendiri; koordinator (+superadmin) bebas.
 */
export async function assertReportAccess(studentId: string, groupId: string) {
  const session = await requireRoleOrThrow(['teacher', 'coordinator', 'student']);
  const role = session.user.role.toLowerCase();

  if (role === 'student') {
    if (session.user.id !== studentId) {
      throw new Error('Forbidden: tidak memiliki akses ke data ini');
    }
    return session;
  }

  if (role === 'teacher') {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group || group.teacherId !== session.user.id) {
      throw new Error('Forbidden: tidak memiliki akses ke kelompok ini');
    }
    return session;
  }

  return session;
}
