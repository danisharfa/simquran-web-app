import { prisma } from '@/lib/prisma';
import { getPeriodGroupIds } from './queries/get-period-group-ids';

export async function recalculateReport(studentId: string, groupId: string) {
  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: { classroom: true },
  });

  const { academicYear, semester } = group.classroom;

  const { allGroupIds } = await getPeriodGroupIds(studentId, academicYear, semester);
  const groupIds = Array.from(new Set([...allGroupIds, groupId]));

  const [tahfidzAgg, tahsinAgg] = await Promise.all([
    prisma.tahfidzScore.aggregate({
      where: { studentId, groupId: { in: groupIds } },
      _avg: { score: true },
    }),
    prisma.tahsinScore.aggregate({
      where: { studentId, groupId: { in: groupIds } },
      _avg: { score: true },
    }),
  ]);

  await prisma.report.upsert({
    where: {
      studentId_academicYear_semester: { studentId, academicYear, semester },
    },
    create: {
      studentId,
      groupId,
      academicYear,
      semester,
      tahfidzScore: tahfidzAgg._avg.score,
      tahsinScore: tahsinAgg._avg.score,
    },
    update: {
      groupId,
      tahfidzScore: tahfidzAgg._avg.score,
      tahsinScore: tahsinAgg._avg.score,
    },
  });
}
