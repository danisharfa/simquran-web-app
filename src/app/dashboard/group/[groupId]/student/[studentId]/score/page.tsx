import { requireRole } from '@/lib/require-role';
import { BackButton } from '@/components/ui/back-button';
import { getScoreContext } from '@/features/scores/queries/get-score-context';
import { listTahfidzScores } from '@/features/scores/queries/list-tahfidz-scores';
import { listTahsinScores } from '@/features/scores/queries/list-tahsin-scores';
import { getReport } from '@/features/scores/queries/get-report';
import { TahfidzScorePanel } from '@/features/scores/components/tahfidz-score-panel';
import { TahsinScorePanel } from '@/features/scores/components/tahsin-score-panel';
import { LastTahsinMaterialCard } from '@/features/scores/components/last-tahsin-material-card';
import { listSurahOptions } from '@/features/quran-reference/queries/list-reference-options';

interface Props {
  params: Promise<{ groupId: string; studentId: string }>;
}

export default async function ScoreInputPage({ params }: Props) {
  await requireRole(['teacher']);
  const { groupId, studentId } = await params;

  const [context, tahfidzScores, tahsinScores, report, surahOptions] = await Promise.all([
    getScoreContext(studentId, groupId),
    listTahfidzScores(studentId, groupId),
    listTahsinScores(studentId, groupId),
    getReport(studentId, groupId),
    listSurahOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href={`/dashboard/group/${groupId}`} />
        <div>
          <h1 className="text-2xl font-bold">Input Nilai — {context.studentName}</h1>
          <p className="text-muted-foreground text-sm">
            NIS {context.nis} &middot; Kelompok {context.groupName}
          </p>
        </div>
      </div>

      <TahfidzScorePanel
        studentId={studentId}
        groupId={groupId}
        scores={tahfidzScores}
        surahOptions={surahOptions}
      />

      <TahsinScorePanel studentId={studentId} groupId={groupId} scores={tahsinScores} />

      <LastTahsinMaterialCard studentId={studentId} groupId={groupId} initialValue={report.lastTahsinMaterial} />
    </div>
  );
}
