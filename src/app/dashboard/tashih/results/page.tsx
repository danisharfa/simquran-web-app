import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihResultCreateDialog } from '@/features/tashih/components/tashih-result-create-dialog';
import { TashihResultTable } from '@/features/tashih/components/tashih-result-table';
import { listAllTashihResults } from '@/features/tashih/queries/list-all-tashih-results';
import { listSchedulesWithPendingRequests } from '@/features/tashih/queries/list-schedules-with-pending-requests';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function TashihResultsPage() {
  const session = await requireRole(['coordinator']);

  const [results, schedules, academicSetting] = await Promise.all([
    listAllTashihResults(),
    listSchedulesWithPendingRequests(),
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
        title="Penilaian Tashih"
        description="Input hasil tashih untuk peserta yang sudah dijadwalkan"
        action={<TashihResultCreateDialog schedules={schedules} />}
      />

      <TashihResultTable
        data={results}
        editable
        currentPeriod={currentPeriod}
        schoolInfo={schoolInfo}
        exportedBy={exportedBy}
      />
    </div>
  );
}
