import { requireRole } from '@/lib/require-role';
import { AddClassroomForm } from '@/features/classrooms/components/add-classroom-form';
import { ClassroomTable } from '@/features/classrooms/components/classroom-table';
import { listClassrooms } from '@/features/classrooms/actions/list-classrooms';
import { listClassroomHistory } from '@/features/classrooms/actions/list-classroom-history';
import { getAcademicSetting } from '@/features/academic-settings/actions/get-academic-setting';

export default async function ClassroomsPage() {
  const session = await requireRole(['admin']);
  const role = session.user.role.toLowerCase();

  if (role === 'admin') {
    const [classrooms, classroomHistory, academicSetting] = await Promise.all([
      listClassrooms(),
      listClassroomHistory(),
      getAcademicSetting(),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Kelas</h1>
          <p className="text-muted-foreground text-sm">Kelola kelas dan anggota kelas</p>
        </div>

        <div className="w-full max-w-xl mx-auto">
          <AddClassroomForm
            defaultAcademicYear={academicSetting?.currentYear}
            defaultSemester={academicSetting?.currentSemester}
          />
        </div>

        <ClassroomTable data={classrooms} title="Daftar Kelas" />
        <ClassroomTable data={classroomHistory} title="Riwayat Kelas" />
      </div>
    );
  }

  return null;
}
