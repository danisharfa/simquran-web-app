import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { TashihRequestTable } from '@/features/tashih/components/tashih-request-table';
import { listAllTashihRequests } from '@/features/tashih/queries/list-all-tashih-requests';

export default async function TashihRequestsPage() {
  await requireRole(['coordinator']);

  const requests = await listAllTashihRequests();

  return (
    <div className="space-y-6">
      <PageHeader title="Permintaan Tashih" description="Terima atau tolak permintaan tashih dari guru" />

      <TashihRequestTable data={requests} showActions />
    </div>
  );
}
