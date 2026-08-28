'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function reactivateStudent(studentId: string) {
  await requireRoleOrThrow(['admin']);

  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: { status: 'AKTIF', exitedAt: null },
  });

  await auth.api.unbanUser({
    body: { userId: studentId },
    headers: await headers(),
  });

  revalidatePath('/dashboard/users');

  return {
    success: true,
    message: 'Siswa berhasil diaktifkan kembali. Tambahkan ke kelas secara manual.',
  };
}
