import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihResultCreateDialog } from '@/features/tashih/components/tashih-result-create-dialog';
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
      <PageHeader
        title="Penilaian Tashih"
        description="Input hasil tashih untuk peserta yang sudah dijadwalkan"
        action={<TashihResultCreateDialog schedules={schedules} />}
      />

      <TashihResultTable data={results} editable />
    </div>
  );
}
