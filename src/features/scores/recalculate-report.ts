import { prisma } from '@/lib/prisma';

export async function recalculateReport(studentId: string, groupId: string) {
  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: { classroom: true },
  });

  const [tahfidzAgg, tahsinAgg] = await Promise.all([
    prisma.tahfidzScore.aggregate({ where: { studentId, groupId }, _avg: { score: true } }),
    prisma.tahsinScore.aggregate({ where: { studentId, groupId }, _avg: { score: true } }),
  ]);

  await prisma.report.upsert({
    where: {
      studentId_groupId_academicYear_semester: {
        studentId,
        groupId,
        academicYear: group.classroom.academicYear,
        semester: group.classroom.semester,
      },
    },
    create: {
      studentId,
      groupId,
      academicYear: group.classroom.academicYear,
      semester: group.classroom.semester,
      tahfidzScore: tahfidzAgg._avg.score,
      tahsinScore: tahsinAgg._avg.score,
    },
    update: {
      tahfidzScore: tahfidzAgg._avg.score,
      tahsinScore: tahsinAgg._avg.score,
    },
  });
}
