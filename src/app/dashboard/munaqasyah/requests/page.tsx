import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { MunaqasyahRequestTable } from '@/features/munaqasyah/components/munaqasyah-request-table';
import { listAllMunaqasyahRequests } from '@/features/munaqasyah/queries/list-all-munaqasyah-requests';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

export default async function MunaqasyahRequestsPage() {
  await requireRole(['coordinator']);

  const [requests, academicSetting] = await Promise.all([listAllMunaqasyahRequests(), getAcademicSetting()]);
  const currentPeriod = academicSetting ? `${academicSetting.currentYear}|${academicSetting.currentSemester}` : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permintaan Munaqasyah"
        description="Terima atau tolak permintaan Tasmi/Munaqasyah dari guru"
      />

      <MunaqasyahRequestTable data={requests} showActions currentPeriod={currentPeriod} />
    </div>
  );
}
