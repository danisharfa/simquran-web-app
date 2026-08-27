import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihResultTable } from '@/features/tashih/components/tashih-result-table';
import { listMyTashihResults } from '@/features/tashih/queries/list-my-tashih-results';
import { listOwnTashihResults } from '@/features/tashih/queries/list-own-tashih-results';

export default async function TashihResultPage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const results = role === 'student' ? await listOwnTashihResults() : await listMyTashihResults();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hasil Tashih"
        description={role === 'student' ? 'Hasil tashih Anda' : 'Hasil tashih siswa bimbingan Anda'}
      />

      <TashihResultTable data={results} />
    </div>
  );
}
