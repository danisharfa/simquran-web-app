import { requireRole } from '@/lib/require-role';
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
      <div>
        <h1 className="text-2xl font-bold">Input Setoran</h1>
        <p className="text-muted-foreground text-sm">Catat setoran harian tahfidz/tahsin siswa</p>
      </div>

      <SubmissionForm
        groups={groups}
        surahOptions={surahOptions}
        juzOptions={juzOptions}
        wafaOptions={wafaOptions}
      />
    </div>
  );
}
