import { requireRole } from '@/lib/require-role';
import { TashihRequestTable } from '@/features/tashih/components/tashih-request-table';
import { listAllTashihRequests } from '@/features/tashih/queries/list-all-tashih-requests';

export default async function TashihRequestsPage() {
  await requireRole(['coordinator']);

  const requests = await listAllTashihRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Permintaan Tashih</h1>
        <p className="text-muted-foreground text-sm">Terima atau tolak permintaan tashih dari guru</p>
      </div>

      <TashihRequestTable data={requests} showActions />
    </div>
  );
}
