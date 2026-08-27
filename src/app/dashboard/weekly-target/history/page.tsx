import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { WeeklyTargetTable } from '@/features/weekly-targets/components/weekly-target-table';
import { listMyWeeklyTargets } from '@/features/weekly-targets/queries/list-my-weekly-targets';
import { listSurahOptions, listWafaOptions } from '@/features/quran-reference/queries/list-reference-options';

export default async function WeeklyTargetHistoryPage() {
  await requireRole(['teacher']);

  const [targets, surahOptions, wafaOptions] = await Promise.all([
    listMyWeeklyTargets(),
    listSurahOptions(),
    listWafaOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Target Setoran" description="Target mingguan yang pernah Anda buat" />

      <WeeklyTargetTable data={targets} editable surahOptions={surahOptions} wafaOptions={wafaOptions} />
    </div>
  );
}
