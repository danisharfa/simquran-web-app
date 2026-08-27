import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { WeeklyTargetTable } from '@/features/weekly-targets/components/weekly-target-table';
import { listOwnWeeklyTargets } from '@/features/weekly-targets/queries/list-own-weekly-targets';

export default async function WeeklyTargetPage() {
  await requireRole(['student']);

  const targets = await listOwnWeeklyTargets();

  return (
    <div className="space-y-6">
      <PageHeader title="Target Setoran" description="Target hafalan/bacaan mingguan Anda" />

      <WeeklyTargetTable data={targets} />
    </div>
  );
}
