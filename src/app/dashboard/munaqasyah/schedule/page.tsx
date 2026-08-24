import { requireRole } from '@/lib/require-role';
import { MyMunaqasyahScheduleTable } from '@/features/munaqasyah/components/my-munaqasyah-schedule-table';
import { listMyMunaqasyahSchedule } from '@/features/munaqasyah/queries/list-my-munaqasyah-schedule';
import { listOwnMunaqasyahSchedule } from '@/features/munaqasyah/queries/list-own-munaqasyah-schedule';

export default async function MunaqasyahSchedulePage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const schedule =
    role === 'student' ? await listOwnMunaqasyahSchedule() : await listMyMunaqasyahSchedule();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jadwal Munaqasyah</h1>
        <p className="text-muted-foreground text-sm">
          {role === 'student' ? 'Jadwal Tasmi/Munaqasyah Anda' : 'Jadwal Tasmi/Munaqasyah siswa bimbingan Anda'}
        </p>
      </div>

      <MyMunaqasyahScheduleTable data={schedule} />
    </div>
  );
}
