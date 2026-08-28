import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
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

  const uniqueJuzIds = [...new Set(pendingAssessments.filter((a) => a.jenis === 'TASMI').map((a) => a.juzId))];
  const surahsByJuzEntries = await Promise.all(
    uniqueJuzIds.map(async (juzId): Promise<[number, SurahInJuz[]]> => [juzId, await listSurahsInJuz(juzId)]),
  );
  const surahsByJuz = Object.fromEntries(surahsByJuzEntries);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penilaian Munaqasyah"
        description="Nilai peserta yang dijadwalkan kepada Anda sebagai penguji"
      />

      <AssessmentPanel pendingAssessments={pendingAssessments} surahsByJuz={surahsByJuz} />

      <MunaqasyahResultTable data={results} />
    </div>
  );
}
