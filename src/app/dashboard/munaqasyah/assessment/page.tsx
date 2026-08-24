import { requireRole } from '@/lib/require-role';
import { AssessmentPanel } from '@/features/munaqasyah/components/assessment-panel';
import { MunaqasyahResultTable } from '@/features/munaqasyah/components/munaqasyah-result-table';
import { listMyPendingAssessments } from '@/features/munaqasyah/queries/list-my-pending-assessments';
import { listSurahsInJuz, type SurahInJuz } from '@/features/munaqasyah/queries/list-surahs-in-juz';
import { listMyMunaqasyahResults } from '@/features/munaqasyah/queries/list-my-munaqasyah-results';

export default async function MunaqasyahAssessmentPage() {
  await requireRole(['teacher']);

  const [pendingAssessments, results] = await Promise.all([
    listMyPendingAssessments(),
    listMyMunaqasyahResults(),
  ]);

  const uniqueJuzIds = [...new Set(pendingAssessments.filter((a) => a.stage === 'TASMI').map((a) => a.juzId))];
  const surahsByJuzEntries = await Promise.all(
    uniqueJuzIds.map(async (juzId): Promise<[number, SurahInJuz[]]> => [juzId, await listSurahsInJuz(juzId)]),
  );
  const surahsByJuz = Object.fromEntries(surahsByJuzEntries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Penilaian Munaqasyah</h1>
        <p className="text-muted-foreground text-sm">Nilai peserta yang dijadwalkan kepada Anda sebagai penguji</p>
      </div>

      <AssessmentPanel pendingAssessments={pendingAssessments} surahsByJuz={surahsByJuz} />

      <MunaqasyahResultTable data={results} />
    </div>
  );
}
