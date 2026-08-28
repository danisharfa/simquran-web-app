import { prisma } from '@/lib/prisma';
import { assertReportAccess } from '../assert-report-access';

export interface ReportData {
  tahfidzScore: number | null;
  tahsinScore: number | null;
  lastTahsinMaterial: string | null;
  academicYear: string | null;
  semester: string | null;
}

export async function getReport(studentId: string, groupId: string): Promise<ReportData> {
  await assertReportAccess(studentId, groupId);

  const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId }, include: { classroom: true } });

  const report = await prisma.report.findUnique({
    where: {
      studentId_academicYear_semester: {
        studentId,
        academicYear: group.classroom.academicYear,
        semester: group.classroom.semester,
      },
    },
  });

  return {
    tahfidzScore: report?.tahfidzScore ?? null,
    tahsinScore: report?.tahsinScore ?? null,
    lastTahsinMaterial: report?.lastTahsinMaterial ?? null,
    academicYear: report?.academicYear ?? null,
    semester: report?.semester ?? null,
  };
}
