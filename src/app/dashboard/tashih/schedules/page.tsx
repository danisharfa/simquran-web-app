import { requireRole } from '@/lib/require-role';
import { TashihScheduleForm } from '@/features/tashih/components/tashih-schedule-form';
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
      <div>
        <h1 className="text-2xl font-bold">Penjadwalan Tashih</h1>
        <p className="text-muted-foreground text-sm">Jadwalkan sesi tashih untuk permintaan yang diterima</p>
      </div>

      <TashihScheduleForm schedulableRequests={schedulableRequests} />

      <TashihScheduleTable data={schedules} />
    </div>
  );
}
