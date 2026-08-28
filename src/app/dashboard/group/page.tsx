import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { AddGroupForm } from '@/features/groups/components/add-group-form';
import { GroupTable } from '@/features/groups/components/group-table';
import { listGroups } from '@/features/groups/queries/list-groups';
import { listGroupHistory } from '@/features/groups/queries/list-group-history';
import { listMyGroups } from '@/features/groups/queries/list-my-groups';
import { listMyGroupHistory } from '@/features/groups/queries/list-my-group-history';
import { listActiveClassrooms } from '@/features/groups/queries/list-active-classrooms';
import { listTeachers } from '@/features/groups/queries/list-teachers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function GroupPage() {
  const session = await requireRole(['coordinator', 'teacher']);
  const role = session.user.role.toLowerCase();

  if (role === 'teacher') {
    const [groups, groupHistory] = await Promise.all([listMyGroups(), listMyGroupHistory()]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Kelompok Bimbingan"
          description="Kelompok tahfidz/tahsin yang Anda bimbing"
        />

        <Tabs defaultValue="daftar">
          <TabsList>
            <TabsTrigger value="daftar">Daftar Kelompok</TabsTrigger>
            <TabsTrigger value="riwayat">Riwayat Kelompok</TabsTrigger>
          </TabsList>
          <TabsContent value="daftar">
            <GroupTable data={groups} title="Daftar Kelompok" />
          </TabsContent>
          <TabsContent value="riwayat">
            <GroupTable data={groupHistory} title="Riwayat Kelompok" />
          </TabsContent>
        </Tabs>
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
      <PageHeader
        title="Manajemen Kelompok"
        description="Kelola kelompok tahfidz/tahsin dan anggotanya"
        action={<AddGroupForm classrooms={classrooms} teachers={teachers} />}
      />

      <Tabs defaultValue="daftar">
        <TabsList>
          <TabsTrigger value="daftar">Daftar Kelompok</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Kelompok</TabsTrigger>
        </TabsList>
        <TabsContent value="daftar">
          <GroupTable data={groups} title="Daftar Kelompok" editable />
        </TabsContent>
        <TabsContent value="riwayat">
          <GroupTable data={groupHistory} title="Riwayat Kelompok" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
