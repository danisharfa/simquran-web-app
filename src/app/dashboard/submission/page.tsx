import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { SubmissionTable } from '@/features/submissions/components/submission-table';
import { listAllSubmissions } from '@/features/submissions/queries/list-all-submissions';
import { listOwnSubmissions } from '@/features/submissions/queries/list-own-submissions';

export default async function SubmissionPage() {
  const session = await requireRole(['coordinator', 'student']);
  const role = session.user.role.toLowerCase();

  const submissions = role === 'student' ? await listOwnSubmissions() : await listAllSubmissions();

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === 'student' ? 'Riwayat Setoran' : 'Monitoring Setoran'}
        description={
          role === 'student'
            ? 'Riwayat setoran tahfidz/tahsin Anda'
            : 'Pantau setoran tahfidz/tahsin seluruh siswa'
        }
      />

      <SubmissionTable data={submissions} />
    </div>
  );
}
