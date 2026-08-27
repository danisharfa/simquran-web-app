import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { HomeActivityTable } from '@/features/home-activities/components/home-activity-table';
import { listAllHomeActivities } from '@/features/home-activities/queries/list-all-home-activities';
import { listGroupHomeActivities } from '@/features/home-activities/queries/list-group-home-activities';

export default async function HomeActivityMonitorPage() {
  const session = await requireRole(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();

  const activities =
    role === 'teacher' ? await listGroupHomeActivities() : await listAllHomeActivities();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aktivitas Rumah Siswa"
        description="Pantau aktivitas murajaah/tilawah/tarjamah siswa"
      />

      <HomeActivityTable data={activities} />
    </div>
  );
}
