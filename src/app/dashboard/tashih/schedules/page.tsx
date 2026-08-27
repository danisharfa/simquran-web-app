import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihScheduleCreateDialog } from '@/features/tashih/components/tashih-schedule-create-dialog';
import { TashihScheduleTable } from '@/features/tashih/components/tashih-schedule-table';
import { listTashihSchedules } from '@/features/tashih/queries/list-tashih-schedules';
import { listSchedulableRequests } from '@/features/tashih/queries/list-schedulable-requests';

export default async function TashihSchedulesPage() {
  await requireRole(['coordinator']);

  const [schedules, schedulableRequests] = await Promise.all([
    listTashihSchedules(),
    listSchedulableRequests(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penjadwalan Tashih"
        description="Jadwalkan sesi tashih untuk permintaan yang diterima"
        action={<TashihScheduleCreateDialog schedulableRequests={schedulableRequests} />}
      />

      <TashihScheduleTable data={schedules} />
    </div>
  );
}
