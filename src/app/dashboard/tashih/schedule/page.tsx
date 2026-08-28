import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MyTashihScheduleTable } from '@/features/tashih/components/my-tashih-schedule-table';
import { listMyTashihSchedule } from '@/features/tashih/queries/list-my-tashih-schedule';
import { listOwnTashihSchedule } from '@/features/tashih/queries/list-own-tashih-schedule';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function TashihSchedulePage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const [schedule, academicSetting] = await Promise.all([
    role === 'student' ? listOwnTashihSchedule() : listMyTashihSchedule(),
    getAcademicSetting(),
  ]);
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;
  const schoolInfo = academicSetting
    ? { schoolName: academicSetting.schoolName, schoolAddress: academicSetting.schoolAddress }
    : { schoolName: '-', schoolAddress: null };
  const exportedBy = { name: session.user.name, role: session.user.role };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Tashih"
        description={role === 'student' ? 'Jadwal tashih Anda' : 'Jadwal tashih siswa bimbingan Anda'}
      />

      <MyTashihScheduleTable
        data={schedule}
        own={role === 'student'}
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
