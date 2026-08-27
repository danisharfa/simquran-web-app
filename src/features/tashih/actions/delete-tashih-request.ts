'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function deleteTashihRequest(requestId: string) {
  const session = await requireRoleOrThrow(['teacher']);

  const existing = await prisma.tashihRequest.findUnique({ where: { id: requestId } });
  if (!existing || existing.teacherId !== session.user.id) {
    return { success: false, message: 'Permintaan tidak ditemukan' };
  }
  if (existing.status !== 'MENUNGGU' && existing.status !== 'DITOLAK') {
    return { success: false, message: 'Permintaan hanya dapat dihapus saat berstatus menunggu atau ditolak' };
  }

  await prisma.tashihRequest.delete({ where: { id: requestId } });

  revalidatePath('/dashboard/tashih/request');

  return { success: true, message: 'Permintaan tashih berhasil dihapus' };
}
