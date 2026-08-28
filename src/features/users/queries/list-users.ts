import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { headers } from 'next/headers';
import type { Role, StudentStatus } from '@/lib/generated/prisma/enums';

export interface UserTableData {
  id: string;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status?: StudentStatus;
  graduatedAt?: Date | null;
  exitedAt?: Date | null;
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

  let studentProfiles: Map<
    string,
    { status: StudentStatus; graduatedAt: Date | null; exitedAt: Date | null }
  > | null = null;

  if (role === 'STUDENT') {
    const profiles = await prisma.studentProfile.findMany({
      select: { userId: true, status: true, graduatedAt: true, exitedAt: true },
    });

    // siswa yang pindah/keluar sekolah punya tab tersendiri (Siswa Nonaktif)
    const exitedIds = new Set(
      profiles.filter((p) => p.status === 'PINDAH' || p.status === 'KELUAR').map((p) => p.userId),
    );
    users = users.filter((user) => !exitedIds.has(user.id));

    studentProfiles = new Map(profiles.map((p) => [p.userId, p]));
  }

  return users.map((user) => ({
    id: user.id,
    username: user.username ?? '',
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    status: studentProfiles?.get(user.id)?.status,
    graduatedAt: studentProfiles?.get(user.id)?.graduatedAt,
    exitedAt: studentProfiles?.get(user.id)?.exitedAt,
  }));
}
