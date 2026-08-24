import { requireRole } from '@/lib/require-role';
import { SubmissionTable } from '@/features/submissions/components/submission-table';
import { listMySubmissions } from '@/features/submissions/queries/list-my-submissions';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import {
  listSurahOptions,
  listJuzOptions,
  listWafaOptions,
} from '@/features/quran-reference/queries/list-reference-options';

export default async function SubmissionHistoryPage() {
  await requireRole(['teacher']);

  const [submissions, groups, surahOptions, juzOptions, wafaOptions] = await Promise.all([
    listMySubmissions(),
    listMyGroupsWithStudents(),
    listSurahOptions(),
    listJuzOptions(),
    listWafaOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Setoran</h1>
        <p className="text-muted-foreground text-sm">Setoran yang pernah Anda catat</p>
      </div>

      <SubmissionTable
        data={submissions}
        editable
        groups={groups}
        surahOptions={surahOptions}
        juzOptions={juzOptions}
        wafaOptions={wafaOptions}
      />
    </div>
  );
}
