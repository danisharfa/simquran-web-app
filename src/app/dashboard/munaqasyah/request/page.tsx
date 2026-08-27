import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahRequestCreateDialog } from '@/features/munaqasyah/components/munaqasyah-request-create-dialog';
import { MunaqasyahRequestTable } from '@/features/munaqasyah/components/munaqasyah-request-table';
import { listMyMunaqasyahRequests } from '@/features/munaqasyah/queries/list-my-munaqasyah-requests';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import { listJuzOptions } from '@/features/quran-reference/queries/list-reference-options';

export default async function MunaqasyahRequestPage() {
  await requireRole(['teacher']);

  const [requests, groups, juzOptions] = await Promise.all([
    listMyMunaqasyahRequests(),
    listMyGroupsWithStudents(),
    listJuzOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Munaqasyah"
        description="Ajukan Tasmi/Munaqasyah untuk siswa bimbingan Anda"
        action={<MunaqasyahRequestCreateDialog groups={groups} juzOptions={juzOptions} />}
      />

      <MunaqasyahRequestTable data={requests} editable groups={groups} juzOptions={juzOptions} />
    </div>
  );
}
