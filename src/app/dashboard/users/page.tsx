import { requireRole } from '@/lib/require-role';
import { AddUserForm } from '@/features/users/components/create-user-form';
import { UserTable } from '@/features/users/components/user-table';
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
            <p className="text-muted-foreground text-sm">Kelola akun semua pengguna</p>
          </div>

          <AddUserForm />
        </div>

        <UserTable data={admins} title="Daftar Admin" />
        <UserTable data={coordinators} title="Daftar Koordinator" />
        <UserTable data={teachers} title="Daftar Guru" />
        <UserTable data={students} title="Daftar Siswa" />
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
            <p className="text-muted-foreground text-sm">Kelola akun staf dan siswa</p>
          </div>

          <AddUserForm allowedRoles={['COORDINATOR', 'TEACHER', 'STUDENT']} />
        </div>

        <UserTable data={coordinators} title="Daftar Koordinator" />
        <UserTable data={teachers} title="Daftar Guru" />
        <UserTable data={students} title="Daftar Siswa" />
      </div>
    );
  }

  return null;
}
