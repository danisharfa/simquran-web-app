import { requireRole } from '@/lib/require-role';
import { TashihResultForm } from '@/features/tashih/components/tashih-result-form';
import { TashihResultTable } from '@/features/tashih/components/tashih-result-table';
import { listAllTashihResults } from '@/features/tashih/queries/list-all-tashih-results';
import { listSchedulesWithPendingRequests } from '@/features/tashih/queries/list-schedules-with-pending-requests';

export default async function TashihResultsPage() {
  await requireRole(['coordinator']);

  const [results, schedules] = await Promise.all([
    listAllTashihResults(),
    listSchedulesWithPendingRequests(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Penilaian Tashih</h1>
        <p className="text-muted-foreground text-sm">Input hasil tashih untuk peserta yang sudah dijadwalkan</p>
      </div>

      <TashihResultForm schedules={schedules} />

      <TashihResultTable data={results} editable />
    </div>
  );
}
