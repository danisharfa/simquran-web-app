import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { getScoreContext } from '@/features/scores/queries/get-score-context';
import { listTahfidzScores } from '@/features/scores/queries/list-tahfidz-scores';
import { listTahsinScores } from '@/features/scores/queries/list-tahsin-scores';
import { getReport } from '@/features/scores/queries/get-report';
import { getReportPdfData } from '@/features/scores/queries/get-report-pdf-data';
import { ReportView } from '@/features/scores/components/report-view';
import { ExportReportPdfButton } from '@/features/scores/components/export-report-pdf-button';

interface Props {
  params: Promise<{ groupId: string; studentId: string }>;
}

export default async function GroupStudentReportPage({ params }: Props) {
  await requireRole(['teacher', 'coordinator']);
  const { groupId, studentId } = await params;

  const [context, tahfidzScores, tahsinScores, report, pdfData] = await Promise.all([
    getScoreContext(studentId, groupId),
    listTahfidzScores(studentId, groupId),
    listTahsinScores(studentId, groupId),
    getReport(studentId, groupId),
    getReportPdfData(studentId, groupId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapor Siswa"
        backHref={`/dashboard/group/${groupId}`}
        action={<ExportReportPdfButton data={pdfData} />}
      />

      <ReportView
        studentName={context.studentName}
        nis={context.nis}
        groupName={context.groupName}
        report={report}
        tahfidzScores={tahfidzScores}
        tahsinScores={tahsinScores}
      />
    </div>
  );
}
