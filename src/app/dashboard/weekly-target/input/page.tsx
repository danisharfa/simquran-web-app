import { requireRole } from '@/lib/require-role';
import { WeeklyTargetForm } from '@/features/weekly-targets/components/weekly-target-form';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import { listSurahOptions, listWafaOptions } from '@/features/quran-reference/queries/list-reference-options';

export default async function WeeklyTargetInputPage() {
  await requireRole(['teacher']);

  const [groups, surahOptions, wafaOptions] = await Promise.all([
    listMyGroupsWithStudents(),
    listSurahOptions(),
    listWafaOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Input Target Setoran</h1>
        <p className="text-muted-foreground text-sm">Tetapkan target hafalan/bacaan mingguan siswa</p>
      </div>

      <WeeklyTargetForm groups={groups} surahOptions={surahOptions} wafaOptions={wafaOptions} />
    </div>
  );
}
