import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MyMunaqasyahScheduleTable } from '@/features/munaqasyah/components/my-munaqasyah-schedule-table';
import { listMyMunaqasyahSchedule } from '@/features/munaqasyah/queries/list-my-munaqasyah-schedule';
import { listOwnMunaqasyahSchedule } from '@/features/munaqasyah/queries/list-own-munaqasyah-schedule';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function MunaqasyahSchedulePage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const [schedule, academicSetting] = await Promise.all([
    role === 'student' ? listOwnMunaqasyahSchedule() : listMyMunaqasyahSchedule(),
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
        title="Jadwal Munaqasyah"
        description={
          role === 'student' ? 'Jadwal Tasmi/Munaqasyah Anda' : 'Jadwal Tasmi/Munaqasyah siswa bimbingan Anda'
        }
      />

      <MyMunaqasyahScheduleTable
        data={schedule}
        own={role === 'student'}
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
