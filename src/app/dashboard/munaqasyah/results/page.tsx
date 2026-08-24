import { requireRole } from '@/lib/require-role';
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
      <div>
        <h1 className="text-2xl font-bold">Penilaian Munaqasyah</h1>
        <p className="text-muted-foreground text-sm">Pantau hasil Tasmi, Munaqasyah, dan nilai akhir gabungan</p>
      </div>

      <MunaqasyahFinalResultTable data={finalResults} />
      <MunaqasyahResultTable data={results} />
    </div>
  );
}
