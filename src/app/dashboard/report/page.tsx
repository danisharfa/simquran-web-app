import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MyReportPanel } from '@/features/scores/components/my-report-panel';

export default async function MyReportPage() {
  await requireRole(['student']);

  return (
    <div className="space-y-6">
      <PageHeader title="Rapor" />

      <MyReportPanel />
    </div>
  );
}
