import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MyTashihScheduleTable } from '@/features/tashih/components/my-tashih-schedule-table';
import { listMyTashihSchedule } from '@/features/tashih/queries/list-my-tashih-schedule';
import { listOwnTashihSchedule } from '@/features/tashih/queries/list-own-tashih-schedule';

export default async function TashihSchedulePage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const schedule = role === 'student' ? await listOwnTashihSchedule() : await listMyTashihSchedule();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Tashih"
        description={role === 'student' ? 'Jadwal tashih Anda' : 'Jadwal tashih siswa bimbingan Anda'}
      />

      <MyTashihScheduleTable data={schedule} />
    </div>
  );
}
