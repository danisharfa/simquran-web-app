import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { SubmissionTable } from '@/features/submissions/components/submission-table';
import { SubmissionCreateDialog } from '@/features/submissions/components/submission-create-dialog';
import { listAllSubmissions } from '@/features/submissions/queries/list-all-submissions';
import { listMySubmissions } from '@/features/submissions/queries/list-my-submissions';
import { listOwnSubmissions } from '@/features/submissions/queries/list-own-submissions';
import { listMyGroupsWithStudents } from '@/features/groups/queries/list-my-groups-with-students';
import {
  listSurahOptions,
  listJuzOptions,
  listSurahJuzMap,
  listWafaOptions,
} from '@/features/quran-reference/queries/list-reference-options';

export default async function SubmissionPage() {
  const session = await requireRole(['teacher', 'coordinator', 'student']);
  const role = session.user.role.toLowerCase();

  if (role === 'teacher') {
    const [submissions, groups, surahOptions, juzOptions, surahJuzMap, wafaOptions] = await Promise.all([
      listMySubmissions(),
      listMyGroupsWithStudents(),
      listSurahOptions(),
      listJuzOptions(),
      listSurahJuzMap(),
      listWafaOptions(),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Setoran"
          description="Kelola setoran tahfidz/tahsin siswa bimbingan Anda"
          action={
            <SubmissionCreateDialog
              groups={groups}
              surahOptions={surahOptions}
              juzOptions={juzOptions}
              surahJuzMap={surahJuzMap}
              wafaOptions={wafaOptions}
            />
          }
        />

        <SubmissionTable
          data={submissions}
          editable
          groups={groups}
          surahOptions={surahOptions}
          juzOptions={juzOptions}
          surahJuzMap={surahJuzMap}
          wafaOptions={wafaOptions}
        />
      </div>
    );
  }

  if (role === 'coordinator') {
    const submissions = await listAllSubmissions();

    return (
      <div className="space-y-6">
        <PageHeader title="Monitoring Setoran" description="Pantau setoran tahfidz/tahsin seluruh siswa" />

        <SubmissionTable data={submissions} showClassroom />
      </div>
    );
  }

  const submissions = await listOwnSubmissions();

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Setoran" description="Riwayat setoran tahfidz/tahsin Anda" />

      <SubmissionTable data={submissions} own />
    </div>
  );
}
