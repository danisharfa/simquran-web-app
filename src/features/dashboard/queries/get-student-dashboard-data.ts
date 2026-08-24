import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface StudentDashboardData {
  activeTargetCount: number;
  achievedTargetCount: number;
  submissionCount: number;
  scoreChart: { name: string; score: number }[];
}

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const session = await requireRoleOrThrow(['student']);

  const [activeTargetCount, achievedTargetCount, submissionCount, tahfidzScores, tahsinScores] =
    await Promise.all([
      prisma.weeklyTarget.count({ where: { studentId: session.user.id, status: 'TIDAK_TERCAPAI' } }),
      prisma.weeklyTarget.count({ where: { studentId: session.user.id, status: 'TERCAPAI' } }),
      prisma.submission.count({ where: { studentId: session.user.id } }),
      prisma.tahfidzScore.findMany({
        where: { studentId: session.user.id },
        include: { surah: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.tahsinScore.findMany({
        where: { studentId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

  const scoreChart = [
    ...tahfidzScores.map((s) => ({ name: s.surah.name, score: s.score })),
    ...tahsinScores.map((s) => ({ name: s.topic, score: s.score })),
  ];

  return { activeTargetCount, achievedTargetCount, submissionCount, scoreChart };
}
