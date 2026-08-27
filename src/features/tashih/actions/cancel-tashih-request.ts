'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export async function cancelTashihRequest(requestId: string) {
  await requireRoleOrThrow(['coordinator']);

  const request = await prisma.tashihRequest.findUnique({
    where: { id: requestId },
    include: { scheduleRequests: { select: { scheduleId: true }, take: 1 } },
  });
  if (!request || (request.status !== 'DITERIMA' && request.status !== 'DITOLAK')) {
    return { success: false, message: 'Permintaan tidak valid atau tidak dapat dibatalkan' };
  }
  if (request.scheduleRequests.length > 0) {
    return { success: false, message: 'Permintaan sudah dijadwalkan dan tidak dapat dibatalkan' };
  }

  await prisma.tashihRequest.update({
    where: { id: requestId },
    data: { status: 'MENUNGGU', coordinatorId: null },
  });

  revalidatePath('/dashboard/tashih/requests');

  return { success: true, message: 'Status permintaan dikembalikan ke menunggu' };
}
