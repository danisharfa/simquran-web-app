'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import type { TashihRequestFieldValues } from '../components/tashih-request-fields';

export async function getTashihRequest(requestId: string): Promise<TashihRequestFieldValues> {
  const session = await requireRoleOrThrow(['teacher']);

  const request = await prisma.tashihRequest.findUniqueOrThrow({ where: { id: requestId } });

  if (request.teacherId !== session.user.id) {
    throw new Error('Forbidden: tidak memiliki akses ke permintaan ini');
  }
  if (request.status !== 'MENUNGGU' && request.status !== 'DITOLAK') {
    throw new Error('Permintaan hanya dapat diedit saat berstatus menunggu atau ditolak');
  }

  return {
    groupId: request.groupId,
    studentId: request.studentId,
    tashihType: request.tashihType,
    juzId: request.juzId,
    surahId: request.surahId,
    wafaId: request.wafaId,
    startPage: request.startPage,
    endPage: request.endPage,
    notes: request.notes ?? '',
  };
}
