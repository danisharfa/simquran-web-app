import { requireRole } from '@/lib/require-role';
import { PageHeader } from '@/components/layouts/page-header';
import { AddUserForm } from '@/features/users/components/create-user-form';
import { UserTableTabs } from '@/features/users/components/user-table-tabs';
import { listUsersByRole } from '@/features/users/queries/list-users';

export default async function UsersPage() {
  const session = await requireRole(['superadmin', 'admin']);
  const role = session.user.role.toLowerCase();

  if (role === 'superadmin') {
    const [admins, coordinators, teachers, students] = await Promise.all([
      listUsersByRole('ADMIN'),
      listUsersByRole('COORDINATOR'),
      listUsersByRole('TEACHER'),
      listUsersByRole('STUDENT'),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Manajemen Pengguna"
          description="Kelola akun semua pengguna"
          action={<AddUserForm />}
        />

        <UserTableTabs
          tabs={[
            { value: 'admin', label: 'Admin', data: admins },
            { value: 'coordinator', label: 'Koordinator', data: coordinators },
            { value: 'teacher', label: 'Guru', data: teachers },
            { value: 'student', label: 'Siswa', data: students },
          ]}
        />
      </div>
    );
  }

  if (role === 'admin') {
    const [coordinators, teachers, students] = await Promise.all([
      listUsersByRole('COORDINATOR'),
      listUsersByRole('TEACHER'),
      listUsersByRole('STUDENT'),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Manajemen Pengguna"
          description="Kelola akun staf dan siswa"
          action={<AddUserForm allowedRoles={['COORDINATOR', 'TEACHER', 'STUDENT']} />}
        />

        <UserTableTabs
          tabs={[
            { value: 'coordinator', label: 'Koordinator', data: coordinators },
            { value: 'teacher', label: 'Guru', data: teachers },
            { value: 'student', label: 'Siswa', data: students },
          ]}
        />
      </div>
    );
  }

  return null;
}
