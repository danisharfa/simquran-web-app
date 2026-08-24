'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface HomeActivityDetail {
  id: string;
  date: Date;
  activityType: 'MURAJAAH' | 'TILAWAH' | 'TARJAMAH';
  juzId: number;
  surahId: number;
  startVerse: number;
  endVerse: number;
  note: string | null;
}

export async function getHomeActivity(activityId: string): Promise<HomeActivityDetail> {
  const session = await requireRoleOrThrow(['student']);

  const activity = await prisma.homeActivity.findUniqueOrThrow({ where: { id: activityId } });

  if (activity.studentId !== session.user.id) {
    throw new Error('Forbidden: tidak memiliki akses ke aktivitas ini');
  }

  return activity;
}
