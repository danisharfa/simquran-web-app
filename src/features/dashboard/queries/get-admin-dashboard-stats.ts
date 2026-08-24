import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface AdminDashboardStats {
  coordinatorCount: number;
  teacherCount: number;
  studentCount: number;
  classroomCount: number;
  groupCount: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await requireRoleOrThrow(['admin']);

  const [coordinatorCount, teacherCount, studentCount, classroomCount, groupCount] = await Promise.all([
    prisma.coordinatorProfile.count(),
    prisma.teacherProfile.count(),
    prisma.studentProfile.count({ where: { status: 'AKTIF' } }),
    prisma.classroom.count({ where: { isActive: true } }),
    prisma.group.count({ where: { isActive: true } }),
  ]);

  return { coordinatorCount, teacherCount, studentCount, classroomCount, groupCount };
}
