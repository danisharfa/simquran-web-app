import { requireRole } from '@/lib/require-role';
import { AddGroupForm } from '@/features/groups/components/add-group-form';
import { GroupTable } from '@/features/groups/components/group-table';
import { listGroups } from '@/features/groups/queries/list-groups';
import { listGroupHistory } from '@/features/groups/queries/list-group-history';
import { listMyGroups } from '@/features/groups/queries/list-my-groups';
import { listActiveClassrooms } from '@/features/groups/queries/list-active-classrooms';
import { listTeachers } from '@/features/groups/queries/list-teachers';

export default async function GroupPage() {
  const session = await requireRole(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();

  if (role === 'teacher') {
    const groups = await listMyGroups();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Kelompok Bimbingan</h1>
          <p className="text-muted-foreground text-sm">Kelompok tahfidz/tahsin yang Anda bimbing</p>
        </div>

        <GroupTable data={groups} title="Daftar Kelompok" />
      </div>
    );
  }

  const [groups, groupHistory, classrooms, teachers] = await Promise.all([
    listGroups(),
    listGroupHistory(),
    listActiveClassrooms(),
    listTeachers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Kelompok</h1>
          <p className="text-muted-foreground text-sm">Kelola kelompok tahfidz/tahsin dan anggotanya</p>
        </div>

        <AddGroupForm classrooms={classrooms} teachers={teachers} />
      </div>

      <GroupTable data={groups} title="Daftar Kelompok" />
      <GroupTable data={groupHistory} title="Riwayat Kelompok" />
    </div>
  );
}
