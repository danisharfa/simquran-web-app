'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function respondTashihRequest(requestId: string, accept: boolean) {
  const session = await requireRoleOrThrow(['coordinator']);

  const request = await prisma.tashihRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== 'MENUNGGU') {
    return { success: false, message: 'Permintaan tidak valid atau sudah diproses' };
  }

  await prisma.tashihRequest.update({
    where: { id: requestId },
    data: { status: accept ? 'DITERIMA' : 'DITOLAK', coordinatorId: session.user.id },
  });

  revalidatePath('/dashboard/tashih/requests');

  return { success: true, message: accept ? 'Permintaan diterima' : 'Permintaan ditolak' };
}
