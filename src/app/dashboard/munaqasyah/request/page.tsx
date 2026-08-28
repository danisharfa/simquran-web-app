import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahRequestCreateDialog } from '@/features/munaqasyah/components/munaqasyah-request-create-dialog';
import { MunaqasyahRequestTable } from '@/features/munaqasyah/components/munaqasyah-request-table';
import { listMyMunaqasyahRequests } from '@/features/munaqasyah/queries/list-my-munaqasyah-requests';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import { listJuzOptions } from '@/features/quran-reference/queries/list-reference-options';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function MunaqasyahRequestPage() {
  await requireRole(['teacher']);

  const [requests, groups, juzOptions, academicSetting] = await Promise.all([
    listMyMunaqasyahRequests(),
    listMyGroupsWithStudents(),
    listJuzOptions(),
    getAcademicSetting(),
  ]);
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Munaqasyah"
        description="Ajukan Tasmi/Munaqasyah untuk siswa bimbingan Anda"
        action={<MunaqasyahRequestCreateDialog groups={groups} juzOptions={juzOptions} />}
      />

      <MunaqasyahRequestTable
        data={requests}
        editable
        groups={groups}
        juzOptions={juzOptions}
        currentPeriod={currentPeriod}
      />
    </div>
  );
}
