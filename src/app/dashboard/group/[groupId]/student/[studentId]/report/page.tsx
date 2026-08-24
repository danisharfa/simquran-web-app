import { requireRole } from '@/lib/require-role';
import { BackButton } from '@/components/ui/back-button';
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton href={`/dashboard/group/${groupId}`} />
          <h1 className="text-2xl font-bold">Rapor Siswa</h1>
        </div>

        <ExportReportPdfButton data={pdfData} />
      </div>

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
