import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahScheduleCreateDialog } from '@/features/munaqasyah/components/munaqasyah-schedule-create-dialog';
import { MunaqasyahScheduleTable } from '@/features/munaqasyah/components/munaqasyah-schedule-table';
import { listMunaqasyahSchedules } from '@/features/munaqasyah/queries/list-munaqasyah-schedules';
import { listSchedulableMunaqasyahRequests } from '@/features/munaqasyah/queries/list-schedulable-requests';
import { listTeachers } from '@/features/groups/queries/list-teachers';

export default async function MunaqasyahSchedulesPage() {
  await requireRole(['coordinator']);

  const [schedules, schedulableRequests, teachers] = await Promise.all([
    listMunaqasyahSchedules(),
    listSchedulableMunaqasyahRequests(),
    listTeachers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penjadwalan Munaqasyah"
        description="Jadwalkan sesi Tasmi/Munaqasyah dan tetapkan penguji"
        action={<MunaqasyahScheduleCreateDialog schedulableRequests={schedulableRequests} teachers={teachers} />}
      />

      <MunaqasyahScheduleTable data={schedules} teachers={teachers} />
    </div>
  );
}
