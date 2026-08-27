import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahRequestTable } from '@/features/munaqasyah/components/munaqasyah-request-table';
import { listAllMunaqasyahRequests } from '@/features/munaqasyah/queries/list-all-munaqasyah-requests';

export default async function MunaqasyahRequestsPage() {
  await requireRole(['coordinator']);

  const requests = await listAllMunaqasyahRequests();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permintaan Munaqasyah"
        description="Terima atau tolak permintaan Tasmi/Munaqasyah dari guru"
      />

      <MunaqasyahRequestTable data={requests} showActions />
    </div>
  );
}
