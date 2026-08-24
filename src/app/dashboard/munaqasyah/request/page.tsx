import { requireRole } from '@/lib/require-role';
import { MunaqasyahRequestForm } from '@/features/munaqasyah/components/munaqasyah-request-form';
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
      <div>
        <h1 className="text-2xl font-bold">Pendaftaran Munaqasyah</h1>
        <p className="text-muted-foreground text-sm">Ajukan Tasmi/Munaqasyah untuk siswa bimbingan Anda</p>
      </div>

      <MunaqasyahRequestForm groups={groups} juzOptions={juzOptions} />

      <MunaqasyahRequestTable data={requests} />
    </div>
  );
}
