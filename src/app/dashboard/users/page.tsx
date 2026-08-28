import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { AddUserForm } from '@/features/users/components/create-user-form';
import { BulkImportUsersDialog } from '@/features/users/components/bulk-import-users-dialog';
import { UserTableTabs } from '@/features/users/components/user-table-tabs';
import { listUsersByRole } from '@/features/users/queries/list-users';
import { listExitedStudents } from '@/features/classrooms/queries/list-exited-students';
import { ExitedStudentTable } from '@/features/classrooms/components/exited-student-table';

export default async function UsersPage() {
  const session = await requireRole(['superadmin', 'admin']);
  const role = session.user.role.toLowerCase();

  if (role === 'superadmin') {
    const [admins, coordinators, teachers, students, exitedStudents] = await Promise.all([
      listUsersByRole('ADMIN'),
      listUsersByRole('COORDINATOR'),
      listUsersByRole('TEACHER'),
      listUsersByRole('STUDENT'),
      listExitedStudents(),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Manajemen Pengguna"
          description="Kelola akun semua pengguna"
          action={
            <>
              <BulkImportUsersDialog />
              <AddUserForm />
            </>
          }
        />

        <UserTableTabs
          tabs={[
            { value: 'admin', label: 'Admin', data: admins },
            { value: 'coordinator', label: 'Koordinator', data: coordinators },
            { value: 'teacher', label: 'Guru', data: teachers },
            { value: 'student', label: 'Siswa', data: students, showStudentColumns: true },
            {
              value: 'exited-student',
              label: 'Siswa Nonaktif',
              data: [],
              count: exitedStudents.length,
              content: <ExitedStudentTable data={exitedStudents} />,
            },
          ]}
        />
      </div>
    );
  }

  if (role === 'admin') {
    const [coordinators, teachers, students, exitedStudents] = await Promise.all([
      listUsersByRole('COORDINATOR'),
      listUsersByRole('TEACHER'),
      listUsersByRole('STUDENT'),
      listExitedStudents(),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Manajemen Pengguna"
          description="Kelola akun staf dan siswa"
          action={
            <>
              <BulkImportUsersDialog allowedRoles={['COORDINATOR', 'TEACHER', 'STUDENT']} />
              <AddUserForm allowedRoles={['COORDINATOR', 'TEACHER', 'STUDENT']} />
            </>
          }
        />

        <UserTableTabs
          tabs={[
            { value: 'coordinator', label: 'Koordinator', data: coordinators },
            { value: 'teacher', label: 'Guru', data: teachers },
            { value: 'student', label: 'Siswa', data: students, showStudentColumns: true },
            {
              value: 'exited-student',
              label: 'Siswa Nonaktif',
              data: [],
              count: exitedStudents.length,
              content: <ExitedStudentTable data={exitedStudents} />,
            },
          ]}
        />
      </div>
    );
  }

  return null;
}
