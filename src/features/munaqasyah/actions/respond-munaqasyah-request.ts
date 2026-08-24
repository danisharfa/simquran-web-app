'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function respondMunaqasyahRequest(requestId: string, accept: boolean) {
  const session = await requireRoleOrThrow(['coordinator']);

  const request = await prisma.munaqasyahRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== 'MENUNGGU') {
    return { success: false, message: 'Permintaan tidak valid atau sudah diproses' };
  }

  await prisma.munaqasyahRequest.update({
    where: { id: requestId },
    data: { status: accept ? 'DITERIMA' : 'DITOLAK', coordinatorId: session.user.id },
  });

  revalidatePath('/dashboard/munaqasyah/requests');

  return { success: true, message: accept ? 'Permintaan diterima' : 'Permintaan ditolak' };
}
