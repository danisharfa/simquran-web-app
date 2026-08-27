import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { SubmissionForm } from '@/features/submissions/components/submission-form';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import {
  listSurahOptions,
  listJuzOptions,
  listWafaOptions,
} from '@/features/quran-reference/queries/list-reference-options';

export default async function SubmissionInputPage() {
  await requireRole(['teacher']);

  const [groups, surahOptions, juzOptions, wafaOptions] = await Promise.all([
    listMyGroupsWithStudents(),
    listSurahOptions(),
    listJuzOptions(),
    listWafaOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Input Setoran" description="Catat setoran harian tahfidz/tahsin siswa" />

      <SubmissionForm
        groups={groups}
        surahOptions={surahOptions}
        juzOptions={juzOptions}
        wafaOptions={wafaOptions}
      />
    </div>
  );
}
