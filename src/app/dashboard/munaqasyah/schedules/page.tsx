import { requireRole } from '@/lib/require-role';
import { MunaqasyahScheduleForm } from '@/features/munaqasyah/components/munaqasyah-schedule-form';
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
      <div>
        <h1 className="text-2xl font-bold">Penjadwalan Munaqasyah</h1>
        <p className="text-muted-foreground text-sm">Jadwalkan sesi Tasmi/Munaqasyah dan tetapkan penguji</p>
      </div>

      <MunaqasyahScheduleForm schedulableRequests={schedulableRequests} teachers={teachers} />

      <MunaqasyahScheduleTable data={schedules} />
    </div>
  );
}
