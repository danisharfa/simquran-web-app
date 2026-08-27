import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
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
      <PageHeader title="Input Target Setoran" description="Tetapkan target hafalan/bacaan mingguan siswa" />

      <WeeklyTargetForm groups={groups} surahOptions={surahOptions} wafaOptions={wafaOptions} />
    </div>
  );
}
