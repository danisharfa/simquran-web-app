import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
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
      <PageHeader title="Riwayat Setoran" description="Setoran yang pernah Anda catat" />

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
