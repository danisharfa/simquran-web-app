import { requireRole } from '@/lib/require-role';
import { SubmissionTable } from '@/features/submissions/components/submission-table';
import { listAllSubmissions } from '@/features/submissions/queries/list-all-submissions';
import { listOwnSubmissions } from '@/features/submissions/queries/list-own-submissions';

export default async function SubmissionPage() {
  const session = await requireRole(['coordinator', 'student']);
  const role = session.user.role.toLowerCase();

  const submissions = role === 'student' ? await listOwnSubmissions() : await listAllSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {role === 'student' ? 'Riwayat Setoran' : 'Monitoring Setoran'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {role === 'student'
            ? 'Riwayat setoran tahfidz/tahsin Anda'
            : 'Pantau setoran tahfidz/tahsin seluruh siswa'}
        </p>
      </div>

      <SubmissionTable data={submissions} />
    </div>
  );
}
