'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { MunaqasyahRequestFieldValues } from '../components/munaqasyah-request-fields';

export async function getMunaqasyahRequest(requestId: string): Promise<MunaqasyahRequestFieldValues> {
  const session = await requireRoleOrThrow(['teacher']);

  const request = await prisma.munaqasyahRequest.findUniqueOrThrow({ where: { id: requestId } });

  if (request.teacherId !== session.user.id) {
    throw new Error('Forbidden: tidak memiliki akses ke permintaan ini');
  }
  if (request.status !== 'MENUNGGU' && request.status !== 'DITOLAK') {
    throw new Error('Permintaan hanya dapat diedit saat berstatus menunggu atau ditolak');
  }

  return {
    groupId: request.groupId,
    studentId: request.studentId,
    batch: request.batch,
    stage: request.stage,
    juzId: request.juzId,
  };
}
