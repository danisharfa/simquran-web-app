import { requireRole } from '@/lib/require-role';
import { WeeklyTargetTable } from '@/features/weekly-targets/components/weekly-target-table';
import { listOwnWeeklyTargets } from '@/features/weekly-targets/queries/list-own-weekly-targets';

export default async function WeeklyTargetPage() {
  await requireRole(['student']);

  const targets = await listOwnWeeklyTargets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Target Setoran</h1>
        <p className="text-muted-foreground text-sm">Target hafalan/bacaan mingguan Anda</p>
      </div>

      <WeeklyTargetTable data={targets} />
    </div>
  );
}
