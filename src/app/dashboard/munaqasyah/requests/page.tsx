import { requireRole } from '@/lib/require-role';
import { MunaqasyahRequestTable } from '@/features/munaqasyah/components/munaqasyah-request-table';
import { listAllMunaqasyahRequests } from '@/features/munaqasyah/queries/list-all-munaqasyah-requests';

export default async function MunaqasyahRequestsPage() {
  await requireRole(['coordinator']);

  const requests = await listAllMunaqasyahRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Permintaan Munaqasyah</h1>
        <p className="text-muted-foreground text-sm">Terima atau tolak permintaan Tasmi/Munaqasyah dari guru</p>
      </div>

      <MunaqasyahRequestTable data={requests} showActions />
    </div>
  );
}
