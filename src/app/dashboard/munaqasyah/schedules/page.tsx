import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahScheduleCreateDialog } from '@/features/munaqasyah/components/munaqasyah-schedule-create-dialog';
import { MunaqasyahScheduleTable } from '@/features/munaqasyah/components/munaqasyah-schedule-table';
import { listMunaqasyahSchedules } from '@/features/munaqasyah/queries/list-munaqasyah-schedules';
import { listSchedulableMunaqasyahRequests } from '@/features/munaqasyah/queries/list-schedulable-requests';
import { listTeachers } from '@/features/groups/queries/list-teachers';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function MunaqasyahSchedulesPage() {
  const session = await requireRole(['coordinator']);

  const [schedules, schedulableRequests, teachers, academicSetting] = await Promise.all([
    listMunaqasyahSchedules(),
    listSchedulableMunaqasyahRequests(),
    listTeachers(),
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
        title="Penjadwalan Munaqasyah"
        description="Jadwalkan sesi Tasmi/Munaqasyah dan tetapkan penguji"
        action={<MunaqasyahScheduleCreateDialog schedulableRequests={schedulableRequests} teachers={teachers} />}
      />

      <MunaqasyahScheduleTable
        data={schedules}
        teachers={teachers}
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
