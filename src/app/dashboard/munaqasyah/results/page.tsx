import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahResultTable } from '@/features/munaqasyah/components/munaqasyah-result-table';
import { MunaqasyahFinalResultTable } from '@/features/munaqasyah/components/munaqasyah-final-result-table';
import { listAllMunaqasyahResults } from '@/features/munaqasyah/queries/list-all-munaqasyah-results';
import { listAllMunaqasyahFinalResults } from '@/features/munaqasyah/queries/list-all-munaqasyah-final-results';

export default async function MunaqasyahResultsPage() {
  await requireRole(['coordinator']);

  const [results, finalResults] = await Promise.all([
    listAllMunaqasyahResults(),
    listAllMunaqasyahFinalResults(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penilaian Munaqasyah"
        description="Pantau hasil Tasmi, Munaqasyah, dan nilai akhir gabungan"
      />

      <MunaqasyahFinalResultTable data={finalResults} />
      <MunaqasyahResultTable data={results} />
    </div>
  );
}
