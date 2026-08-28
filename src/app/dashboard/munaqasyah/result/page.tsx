import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahCombinedResultTable } from '@/features/munaqasyah/components/munaqasyah-combined-result-table';
import { listOwnMunaqasyahCombinedResults } from '@/features/munaqasyah/queries/list-munaqasyah-combined-results';
import { getMunaqasyahGradeSettings } from '@/features/munaqasyah/queries/get-munaqasyah-grade-settings';
import { getFinalScoreWeights } from '@/features/munaqasyah/queries/get-final-score-weights';
import { buildGradeLabelMap } from '@/features/munaqasyah/munaqasyah-scoring';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function MunaqasyahResultPage() {
  const session = await requireRole(['student']);

  const [results, gradeSettings, finalScoreWeights, academicSetting] = await Promise.all([
    listOwnMunaqasyahCombinedResults(),
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

  return (
    <div className="space-y-6">
      <PageHeader title="Hasil Munaqasyah" description="Hasil Tasmi, Munaqasyah, dan nilai akhir Anda" />

      <MunaqasyahCombinedResultTable
        data={results}
        own
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
