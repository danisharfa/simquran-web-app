import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahResultTable } from '@/features/munaqasyah/components/munaqasyah-result-table';
import { MunaqasyahFinalResultTable } from '@/features/munaqasyah/components/munaqasyah-final-result-table';
import { listOwnMunaqasyahResults } from '@/features/munaqasyah/queries/list-own-munaqasyah-results';
import { listOwnMunaqasyahFinalResults } from '@/features/munaqasyah/queries/list-own-munaqasyah-final-results';

export default async function MunaqasyahResultPage() {
  await requireRole(['student']);

  const [results, finalResults] = await Promise.all([
    listOwnMunaqasyahResults(),
    listOwnMunaqasyahFinalResults(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Hasil Munaqasyah" description="Hasil Tasmi, Munaqasyah, dan nilai akhir Anda" />

      <MunaqasyahFinalResultTable data={finalResults} own />
      <MunaqasyahResultTable data={results} own />
    </div>
  );
}
