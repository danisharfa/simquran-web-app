import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { getGroup } from '@/features/groups/queries/get-group';
import { getScoreContext } from '@/features/scores/queries/get-score-context';
import { listTahfidzScores } from '@/features/scores/queries/list-tahfidz-scores';
import { listTahsinScores } from '@/features/scores/queries/list-tahsin-scores';
import { getReport } from '@/features/scores/queries/get-report';
import { getReportPdfData } from '@/features/scores/queries/get-report-pdf-data';
import { ReportView } from '@/features/scores/components/report-view';
import { ExportReportPdfButton } from '@/features/scores/components/export-report-pdf-button';
import { TahfidzScorePanel } from '@/features/scores/components/tahfidz-score-panel';
import { TahsinScorePanel } from '@/features/scores/components/tahsin-score-panel';
import { LastTahsinMaterialCard } from '@/features/scores/components/last-tahsin-material-card';
import { listSurahOptions } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  params: Promise<{ groupId: string; studentId: string }>;
}

export default async function GroupStudentReportPage({ params }: Props) {
  const session = await requireRole(['teacher', 'coordinator']);
  const role = session.user.role.toLowerCase();
  const { groupId, studentId } = await params;

  const [group, context, tahfidzScores, tahsinScores, report, pdfData] = await Promise.all([
    getGroup(groupId),
    getScoreContext(studentId, groupId),
    listTahfidzScores(studentId, groupId),
    listTahsinScores(studentId, groupId),
    getReport(studentId, groupId),
    getReportPdfData(studentId, groupId),
  ]);

  // input nilai hanya untuk guru pembimbing pada kelompok yang masih aktif
  const canInputScore = role === 'teacher' && group.isActive;
  const surahOptions = canInputScore ? await listSurahOptions() : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapor Siswa"
        backHref={`/dashboard/group/${groupId}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canInputScore && (
              <>
                <TahfidzScorePanel
                  studentId={studentId}
                  groupId={groupId}
                  scores={tahfidzScores}
                  surahOptions={surahOptions}
                />
                <TahsinScorePanel studentId={studentId} groupId={groupId} scores={tahsinScores} />
                <LastTahsinMaterialCard
                  studentId={studentId}
                  groupId={groupId}
                  initialValue={report.lastTahsinMaterial}
                />
              </>
            )}
            <ExportReportPdfButton data={pdfData} />
          </div>
        }
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
