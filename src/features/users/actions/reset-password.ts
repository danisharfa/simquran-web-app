'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function resetUserPassword(userId: string) {
  const session = await requireRoleOrThrow(['superadmin', 'admin']);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, role: true },
  });

  if (!user) {
    return { success: false, message: 'User tidak ditemukan' };
  }

  const callerRole = session.user.role;
  if (callerRole === 'ADMIN' && (user.role === 'SUPERADMIN' || user.role === 'ADMIN')) {
    return { success: false, message: 'Admin tidak dapat mereset password akun Admin atau Superadmin' };
  }

  await auth.api.setUserPassword({
    body: { userId, newPassword: user.username },
    headers: await headers(),
  });

  revalidatePath('/dashboard/users');

  return { success: true, message: 'Password berhasil direset' };
}
