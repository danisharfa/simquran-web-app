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

  const report = await prisma.report.findFirst({
    where: { studentId, groupId },
    orderBy: { updatedAt: 'desc' },
  });

  return {
    tahfidzScore: report?.tahfidzScore ?? null,
    tahsinScore: report?.tahsinScore ?? null,
    lastTahsinMaterial: report?.lastTahsinMaterial ?? null,
    academicYear: report?.academicYear ?? null,
    semester: report?.semester ?? null,
  };
}
