'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface WeeklyTargetDetail {
  id: string;
  groupId: string;
  type: 'TAHFIDZ' | 'TAHSIN_WAFA' | 'TAHSIN_ALQURAN';
  startDate: Date;
  endDate: Date;
  description: string;
  status: 'TIDAK_TERCAPAI' | 'TERCAPAI';
  progressPercent: number | null;
  surahStartId: number | null;
  surahEndId: number | null;
  startAyat: number | null;
  endAyat: number | null;
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
}

export async function getWeeklyTarget(targetId: string): Promise<WeeklyTargetDetail> {
  const session = await requireRoleOrThrow(['teacher']);

  const target = await prisma.weeklyTarget.findUniqueOrThrow({ where: { id: targetId } });

  if (target.teacherId !== session.user.id) {
    throw new Error('Forbidden: tidak memiliki akses ke target ini');
  }

  return target;
}
