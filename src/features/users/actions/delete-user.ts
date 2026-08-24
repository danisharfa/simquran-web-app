'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteUser(userId: string) {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return { success: false, message: 'User tidak ditemukan' };
  }

  const callerRole = session.user.role;
  if (callerRole === 'ADMIN' && (user.role === 'SUPERADMIN' || user.role === 'ADMIN')) {
    return { success: false, message: 'Admin tidak dapat menghapus akun Admin atau Superadmin' };
  }

  await auth.api.removeUser({
    body: { userId },
    headers: await headers(),
  });

  revalidatePath('/dashboard/users');

  return { success: true, message: 'User berhasil dihapus' };
}
