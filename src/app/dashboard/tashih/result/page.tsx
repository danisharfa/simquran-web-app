import { requireRole } from '@/lib/require-role';
import { TashihResultTable } from '@/features/tashih/components/tashih-result-table';
import { listMyTashihResults } from '@/features/tashih/queries/list-my-tashih-results';
import { listOwnTashihResults } from '@/features/tashih/queries/list-own-tashih-results';

export default async function TashihResultPage() {
  const session = await requireRole(['teacher', 'student']);
  const role = session.user.role.toLowerCase();

  const results = role === 'student' ? await listOwnTashihResults() : await listMyTashihResults();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hasil Tashih</h1>
        <p className="text-muted-foreground text-sm">
          {role === 'student' ? 'Hasil tashih Anda' : 'Hasil tashih siswa bimbingan Anda'}
        </p>
      </div>

      <TashihResultTable data={results} />
    </div>
  );
}
