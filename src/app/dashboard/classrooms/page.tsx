import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { AddClassroomForm } from '@/features/classrooms/components/add-classroom-form';
import { ClassroomTable } from '@/features/classrooms/components/classroom-table';
import { listClassrooms } from '@/features/classrooms/queries/list-classrooms';
import { listClassroomHistory } from '@/features/classrooms/queries/list-classroom-history';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function ClassroomsPage() {
  await requireRole(['admin']);

  const [classrooms, classroomHistory, academicSetting] = await Promise.all([
    listClassrooms(),
    listClassroomHistory(),
    getAcademicSetting(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kelas"
        description="Kelola kelas dan anggota kelas"
        action={
          <AddClassroomForm
            defaultAcademicYear={academicSetting?.currentYear}
            defaultSemester={academicSetting?.currentSemester}
          />
        }
      />

      <Tabs defaultValue="daftar">
        <TabsList>
          <TabsTrigger value="daftar">Daftar Kelas</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Kelas</TabsTrigger>
        </TabsList>
        <TabsContent value="daftar">
          <ClassroomTable data={classrooms} title="Daftar Kelas" editable />
        </TabsContent>
        <TabsContent value="riwayat">
          <ClassroomTable data={classroomHistory} title="Riwayat Kelas" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
