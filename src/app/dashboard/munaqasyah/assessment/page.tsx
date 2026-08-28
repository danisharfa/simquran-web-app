import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { AssessmentPanel } from '@/features/munaqasyah/components/assessment-panel';
import { MunaqasyahCombinedResultTable } from '@/features/munaqasyah/components/munaqasyah-combined-result-table';
import { listMyPendingAssessments } from '@/features/munaqasyah/queries/list-my-pending-assessments';
import { listSurahsInJuz, type SurahInJuz } from '@/features/munaqasyah/queries/list-surahs-in-juz';
import { listMyMunaqasyahCombinedResults } from '@/features/munaqasyah/queries/list-munaqasyah-combined-results';
import { getAllScoringWeights } from '@/features/munaqasyah/queries/get-scoring-weights';
import { getMunaqasyahGradeSettings } from '@/features/munaqasyah/queries/get-munaqasyah-grade-settings';
import { getFinalScoreWeights } from '@/features/munaqasyah/queries/get-final-score-weights';
import { buildGradeLabelMap } from '@/features/munaqasyah/munaqasyah-scoring';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function MunaqasyahAssessmentPage() {
  const session = await requireRole(['teacher']);

  const [pendingAssessments, results, scoringWeights, gradeSettings, finalScoreWeights, academicSetting] = await Promise.all([
    listMyPendingAssessments(),
    listMyMunaqasyahCombinedResults(),
    getAllScoringWeights(),
    getMunaqasyahGradeSettings(),
    getFinalScoreWeights(),
    getAcademicSetting(),
  ]);
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;
  const schoolInfo = academicSetting
    ? { schoolName: academicSetting.schoolName, schoolAddress: academicSetting.schoolAddress }
    : { schoolName: '-', schoolAddress: null };
  const exportedBy = { name: session.user.name, role: session.user.role };

  const gradeLabelMap = buildGradeLabelMap(gradeSettings);

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

      <AssessmentPanel
        pendingAssessments={pendingAssessments}
        surahsByJuz={surahsByJuz}
        scoringWeights={scoringWeights}
        gradeSettings={gradeSettings}
      />

      <MunaqasyahCombinedResultTable
        data={results}
        gradeSettings={gradeSettings}
        gradeLabelMap={gradeLabelMap}
        finalScoreWeights={finalScoreWeights}
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
