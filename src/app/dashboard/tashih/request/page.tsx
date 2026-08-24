import { requireRole } from '@/lib/require-role';
import { TashihRequestForm } from '@/features/tashih/components/tashih-request-form';
import { TashihRequestTable } from '@/features/tashih/components/tashih-request-table';
import { listMyTashihRequests } from '@/features/tashih/queries/list-my-tashih-requests';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import {
  listSurahOptions,
  listJuzOptions,
  listWafaOptions,
} from '@/features/quran-reference/queries/list-reference-options';

export default async function TashihRequestPage() {
  await requireRole(['teacher']);

  const [requests, groups, surahOptions, juzOptions, wafaOptions] = await Promise.all([
    listMyTashihRequests(),
    listMyGroupsWithStudents(),
    listSurahOptions(),
    listJuzOptions(),
    listWafaOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pendaftaran Tashih</h1>
        <p className="text-muted-foreground text-sm">Ajukan tashih untuk siswa bimbingan Anda</p>
      </div>

      <TashihRequestForm
        groups={groups}
        surahOptions={surahOptions}
        juzOptions={juzOptions}
        wafaOptions={wafaOptions}
      />

      <TashihRequestTable data={requests} />
    </div>
  );
}
