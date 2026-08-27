'use server';

import { requireRoleOrThrow } from '@/lib/require-role';
import { getScoreContext } from '../queries/get-score-context';
import { listTahfidzScores } from '../queries/list-tahfidz-scores';
import { listTahsinScores } from '../queries/list-tahsin-scores';
import { getReport } from '../queries/get-report';
import { getReportPdfData } from '../queries/get-report-pdf-data';

export async function getMyReportData(groupId: string) {
  const session = await requireRoleOrThrow(['student']);
  const studentId = session.user.id;

  const [context, tahfidzScores, tahsinScores, report, pdfData] = await Promise.all([
    getScoreContext(studentId, groupId),
    listTahfidzScores(studentId, groupId),
    listTahsinScores(studentId, groupId),
    getReport(studentId, groupId),
    getReportPdfData(studentId, groupId),
  ]);

  return { context, tahfidzScores, tahsinScores, report, pdfData };
}

export type MyReportData = Awaited<ReturnType<typeof getMyReportData>>;
