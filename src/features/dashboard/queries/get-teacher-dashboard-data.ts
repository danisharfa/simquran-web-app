import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface TeacherDashboardData {
  groupCount: number;
  studentCount: number;
  submissionsThisMonth: number;
  studentScores: { name: string; tahfidz: number; tahsin: number }[];
}

export async function getTeacherDashboardData(): Promise<TeacherDashboardData> {
  const session = await requireRoleOrThrow(['teacher']);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const setting = await prisma.academicSetting.findFirst();

  const [groupCount, studentCount, submissionsThisMonth, reports] = await Promise.all([
    prisma.group.count({ where: { isActive: true, teacherId: session.user.id } }),
    prisma.studentProfile.count({
      where: { status: 'AKTIF', group: { teacherId: session.user.id, isActive: true } },
    }),
    prisma.submission.count({
      where: { teacherId: session.user.id, date: { gte: startOfMonth } },
    }),
    prisma.report.findMany({
      where: {
        group: { teacherId: session.user.id },
        ...(setting ? { academicYear: setting.currentYear, semester: setting.currentSemester } : {}),
      },
      include: { student: { include: { user: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    }),
  ]);

  const studentScores = reports.map((r) => ({
    name: r.student.user.name,
    tahfidz: r.tahfidzScore != null ? Math.round(r.tahfidzScore * 10) / 10 : 0,
    tahsin: r.tahsinScore != null ? Math.round(r.tahsinScore * 10) / 10 : 0,
  }));

  return { groupCount, studentCount, submissionsThisMonth, studentScores };
}
