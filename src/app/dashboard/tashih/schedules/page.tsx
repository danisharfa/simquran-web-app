import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihScheduleCreateDialog } from '@/features/tashih/components/tashih-schedule-create-dialog';
import { TashihScheduleTable } from '@/features/tashih/components/tashih-schedule-table';
import { listTashihSchedules } from '@/features/tashih/queries/list-tashih-schedules';
import { listSchedulableRequests } from '@/features/tashih/queries/list-schedulable-requests';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function TashihSchedulesPage() {
  const session = await requireRole(['coordinator']);

  const [schedules, schedulableRequests, academicSetting] = await Promise.all([
    listTashihSchedules(),
    listSchedulableRequests(),
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
        title="Penjadwalan Tashih"
        description="Jadwalkan sesi tashih untuk permintaan yang diterima"
        action={<TashihScheduleCreateDialog schedulableRequests={schedulableRequests} />}
      />

      <TashihScheduleTable data={schedules} currentPeriod={currentPeriod} schoolInfo={schoolInfo} exportedBy={exportedBy} />
    </div>
  );
}
