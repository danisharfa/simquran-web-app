import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { headers } from 'next/headers';
import type { Role } from '@/lib/generated/prisma/enums';

export interface UserTableData {
  id: string;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

type UserWithUsername = {
  id: string;
  username?: string | null;
  name: string;
  role?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listUsersByRole(role: Role): Promise<UserTableData[]> {
  await requireRoleOrThrow(['superadmin', 'admin']);

  const result = await auth.api.listUsers({
    headers: await headers(),
    query: {
      filterField: 'role',
      filterValue: role,
      sortBy: 'createdAt',
      sortDirection: 'asc',
    },
  });

  let users = result.users as UserWithUsername[];

  // siswa yang pindah/keluar sekolah punya tab tersendiri (Siswa Nonaktif)
  if (role === 'STUDENT') {
    const exited = await prisma.studentProfile.findMany({
      where: { status: { in: ['PINDAH', 'KELUAR'] } },
      select: { userId: true },
    });
    const exitedIds = new Set(exited.map((s) => s.userId));
    users = users.filter((user) => !exitedIds.has(user.id));
  }

  return users.map((user) => ({
    id: user.id,
    username: user.username ?? '',
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}
