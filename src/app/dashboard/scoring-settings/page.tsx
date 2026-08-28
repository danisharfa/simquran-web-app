import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SurahInitialScoreTable } from '@/features/munaqasyah/components/surah-initial-score-table';
import { ScoringWeightsForm } from '@/features/munaqasyah/components/scoring-weights-form';
import { MunaqasyahGradeSettingsForm } from '@/features/munaqasyah/components/munaqasyah-grade-settings-form';
import { FinalScoreWeightsForm } from '@/features/munaqasyah/components/final-score-weights-form';
import { listSurahInitialScores } from '@/features/munaqasyah/queries/list-surah-initial-scores';
import { getAllScoringWeights } from '@/features/munaqasyah/queries/get-scoring-weights';
import { getMunaqasyahGradeSettings } from '@/features/munaqasyah/queries/get-munaqasyah-grade-settings';
import { getFinalScoreWeights } from '@/features/munaqasyah/queries/get-final-score-weights';
import { GradeLetterSettingsForm } from '@/features/scores/components/grade-letter-settings-form';
import { ReportTemplateForm } from '@/features/scores/components/report-template-form';
import { getGradeLetterSettings } from '@/features/scores/queries/get-grade-letter-settings';
import { getReportTemplates } from '@/features/scores/queries/get-report-templates';

export default async function ScoringSettingsPage() {
  const session = await requireRole(['superadmin', 'admin']);
  const readOnly = session.user.role.toLowerCase() !== 'superadmin';

  const [surahScores, scoringWeights, munaqasyahGradeSettings, finalScoreWeights, gradeLetterSettings, reportTemplates] =
    await Promise.all([
      listSurahInitialScores(),
      getAllScoringWeights(),
      getMunaqasyahGradeSettings(),
      getFinalScoreWeights(),
      getGradeLetterSettings(),
      getReportTemplates(),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Penilaian"
        description={
          readOnly
            ? 'Lihat pengaturan penilaian Munaqasyah dan rapor tahfidz/tahsin (hanya lihat)'
            : 'Atur nilai awal Tasmi, bobot pengurangan Khofi/Jali, mapping huruf, dan template nilai rapor'
        }
      />

      <Tabs defaultValue="initial-score">
        <TabsList>
          <TabsTrigger value="initial-score">Nilai Awal Surah</TabsTrigger>
          <TabsTrigger value="weights">Bobot Pengurangan</TabsTrigger>
          <TabsTrigger value="munaqasyah-grade">Batas Lulus Munaqasyah</TabsTrigger>
          <TabsTrigger value="grade-letter">Mapping Huruf</TabsTrigger>
          <TabsTrigger value="templates">Template Nilai Rapor</TabsTrigger>
        </TabsList>

        <TabsContent value="initial-score">
          <SurahInitialScoreTable data={surahScores} readOnly={readOnly} />
        </TabsContent>

        <TabsContent value="weights" className="space-y-6">
          <ScoringWeightsForm
            jenis="TASMI"
            title="Bobot Pengurangan Tasmi"
            description="Pengurangan nilai per kesalahan Khofi/Jali saat penilaian Tasmi"
            weights={scoringWeights.TASMI}
            readOnly={readOnly}
          />
          <ScoringWeightsForm
            jenis="MUNAQASYAH"
            title="Bobot Pengurangan Munaqasyah"
            description="Pengurangan nilai per kesalahan Khofi/Jali saat penilaian Munaqasyah"
            weights={scoringWeights.MUNAQASYAH}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="munaqasyah-grade" className="space-y-6">
          <MunaqasyahGradeSettingsForm settings={munaqasyahGradeSettings} readOnly={readOnly} />
          <FinalScoreWeightsForm weights={finalScoreWeights} readOnly={readOnly} />
        </TabsContent>

        <TabsContent value="grade-letter">
          <GradeLetterSettingsForm settings={gradeLetterSettings} readOnly={readOnly} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <ReportTemplateForm
            type="TAHFIDZ"
            title="Template Deskripsi Tahfidz"
            placeholders="{grade}, {description}, {surahName}"
            template={reportTemplates.TAHFIDZ}
            readOnly={readOnly}
          />
          <ReportTemplateForm
            type="TAHSIN"
            title="Template Deskripsi Tahsin"
            placeholders="{grade}, {description}, {topic}"
            template={reportTemplates.TAHSIN}
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
