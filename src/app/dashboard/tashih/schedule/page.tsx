import { requireRole } from '@/lib/require-role';
import { MyTashihScheduleTable } from '@/features/tashih/components/my-tashih-schedule-table';
import { listMyTashihSchedule } from '@/features/tashih/queries/list-my-tashih-schedule';
import { listOwnTashihSchedule } from '@/features/tashih/queries/list-own-tashih-schedule';

export default async function TashihSchedulePage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const schedule = role === 'student' ? await listOwnTashihSchedule() : await listMyTashihSchedule();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jadwal Tashih</h1>
        <p className="text-muted-foreground text-sm">
          {role === 'student' ? 'Jadwal tashih Anda' : 'Jadwal tashih siswa bimbingan Anda'}
        </p>
      </div>

      <MyTashihScheduleTable data={schedule} />
    </div>
  );
}
