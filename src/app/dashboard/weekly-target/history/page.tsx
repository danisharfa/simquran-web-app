import { requireRole } from '@/lib/require-role';
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
      <div>
        <h1 className="text-2xl font-bold">Riwayat Target Setoran</h1>
        <p className="text-muted-foreground text-sm">Target mingguan yang pernah Anda buat</p>
      </div>

      <WeeklyTargetTable data={targets} editable surahOptions={surahOptions} wafaOptions={wafaOptions} />
    </div>
  );
}
