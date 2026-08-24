import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface CoordinatorDashboardData {
  groupCount: number;
  studentCount: number;
  pendingTashihCount: number;
  pendingMunaqasyahCount: number;
  groupScores: { name: string; tahfidz: number; tahsin: number }[];
}

export async function getCoordinatorDashboardData(): Promise<CoordinatorDashboardData> {
  await requireRoleOrThrow(['coordinator']);

  const [groupCount, studentCount, pendingTashihCount, pendingMunaqasyahCount, groups] = await Promise.all([
    prisma.group.count({ where: { isActive: true } }),
    prisma.studentProfile.count({ where: { status: 'AKTIF', groupId: { not: null } } }),
    prisma.tashihRequest.count({ where: { status: 'MENUNGGU' } }),
    prisma.munaqasyahRequest.count({ where: { status: 'MENUNGGU' } }),
    prisma.group.findMany({
      where: { isActive: true },
      include: { reports: true },
      orderBy: { name: 'asc' },
      take: 8,
    }),
  ]);

  const groupScores = groups.map((group) => {
    const tahfidzScores = group.reports.map((r) => r.tahfidzScore).filter((v): v is number => v != null);
    const tahsinScores = group.reports.map((r) => r.tahsinScore).filter((v): v is number => v != null);

    return {
      name: group.name,
      tahfidz: tahfidzScores.length
        ? Math.round((tahfidzScores.reduce((a, b) => a + b, 0) / tahfidzScores.length) * 10) / 10
        : 0,
      tahsin: tahsinScores.length
        ? Math.round((tahsinScores.reduce((a, b) => a + b, 0) / tahsinScores.length) * 10) / 10
        : 0,
    };
  });

  return { groupCount, studentCount, pendingTashihCount, pendingMunaqasyahCount, groupScores };
}
