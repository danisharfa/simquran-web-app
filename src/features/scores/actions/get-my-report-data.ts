'use server';

import { requireRoleOrThrow } from '@/lib/require-role';
import { getScoreContext } from '../queries/get-score-context';
import { listTahfidzScores } from '../queries/list-tahfidz-scores';
import { listTahsinScores } from '../queries/list-tahsin-scores';
import { getReport } from '../queries/get-report';
import { getReportPdfData } from '../queries/get-report-pdf-data';
import { getGradeLetterSettings } from '../queries/get-grade-letter-settings';
import { buildGradeDescriptionMap } from '../grade';

export async function getMyReportData(groupId: string) {
  const session = await requireRoleOrThrow(['student']);
  const studentId = session.user.id;

  const [context, tahfidzScores, tahsinScores, report, pdfData, gradeSettings] = await Promise.all([
    getScoreContext(studentId, groupId),
    listTahfidzScores(studentId, groupId),
    listTahsinScores(studentId, groupId),
    getReport(studentId, groupId),
    getReportPdfData(studentId, groupId),
    getGradeLetterSettings(),
  ]);

  const gradeDescriptionMap = buildGradeDescriptionMap(gradeSettings);

  return { context, tahfidzScores, tahsinScores, report, pdfData, gradeDescriptionMap };
}

export type MyReportData = Awaited<ReturnType<typeof getMyReportData>>;
