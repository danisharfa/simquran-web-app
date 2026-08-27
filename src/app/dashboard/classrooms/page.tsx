import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { AddClassroomForm } from '@/features/classrooms/components/add-classroom-form';
import { ClassroomTable } from '@/features/classrooms/components/classroom-table';
import { listClassrooms } from '@/features/classrooms/queries/list-classrooms';
import { listClassroomHistory } from '@/features/classrooms/queries/list-classroom-history';
import { getAcademicSetting } from '@/features/academic-settings/queries/get-academic-setting';

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

      <ClassroomTable data={classrooms} title="Daftar Kelas" editable />
      <ClassroomTable data={classroomHistory} title="Riwayat Kelas" />
    </div>
  );
}
