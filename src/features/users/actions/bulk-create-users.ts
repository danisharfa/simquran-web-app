'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { createUserSchema } from '../create-user.schema';

export interface BulkCreateUserRow {
  name: string;
  username: string;
  role: string;
}

export interface BulkCreateUserResult {
  username: string;
  success: boolean;
  error?: string;
}

export async function bulkCreateUsers(rows: BulkCreateUserRow[]) {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);
  const callerRole = session.user.role.toLowerCase();

  const results: BulkCreateUserResult[] = [];

  for (const row of rows) {
    const parsed = createUserSchema.safeParse(row);

    if (!parsed.success) {
      results.push({
        username: row.username || '(kosong)',
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Data tidak valid',
      });
      continue;
    }

    const { name, username, role } = parsed.data;

    if (callerRole === 'admin' && role === 'ADMIN') {
      results.push({
        username,
        success: false,
        error: 'Admin tidak dapat membuat akun dengan role Admin',
      });
      continue;
    }

    const nip = username;
    const nis = username;
    const generatedEmail = `${username}@sekolah.local`;
    const generatedPassword = username;

    let createdUserId: string;

    try {
      const newUser = await auth.api.createUser({
        body: {
          name,
          email: generatedEmail,
          password: generatedPassword,
          role,
          data: { username },
        },
        headers: await headers(),
      });

      createdUserId = newUser.user.id;
    } catch (error) {
      results.push({
        username,
        success: false,
        error: error instanceof Error ? error.message : 'Gagal membuat akun pengguna',
      });
      continue;
    }

    try {
      if (role === 'COORDINATOR') {
        await prisma.coordinatorProfile.create({ data: { userId: createdUserId, nip } });
      }

      if (role === 'TEACHER') {
        await prisma.teacherProfile.create({ data: { userId: createdUserId, nip } });
      }

      if (role === 'STUDENT') {
        await prisma.studentProfile.create({ data: { userId: createdUserId, nis } });
      }

      results.push({ username, success: true });
    } catch (error) {
      await auth.api.removeUser({
        body: { userId: createdUserId },
        headers: await headers(),
      });

      results.push({
        username,
        success: false,
        error:
          error instanceof Error ? `Gagal membuat profil: ${error.message}` : 'Gagal membuat profil pengguna',
      });
    }
  }

  if (results.some((r) => r.success)) {
    revalidatePath('/dashboard/users');
  }

  return results;
}
