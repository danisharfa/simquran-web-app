'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';
import { computeTahfidzProgress } from '../compute-tahfidz-progress';
import { computeTahsinAlquranProgress } from '../compute-tahsin-alquran-progress';
import { computeWafaProgress } from '../compute-wafa-progress';
import type { ProgressItem } from '../types';

export interface OwnProgressResult {
  tahfidz: ProgressItem[];
  tahsinAlquran: ProgressItem[];
  wafa: ProgressItem[];
}

export async function getOwnProgress(): Promise<OwnProgressResult> {
  const session = await requireRoleOrThrow(['student']);

  const setting = await prisma.academicSetting.findFirst();
  const academicYear = setting?.currentYear ?? new Date().getFullYear().toString();
  const semester = setting?.currentSemester ?? 'GANJIL';

  const student = [{ userId: session.user.id, name: session.user.name }];

  const [tahfidz, tahsinAlquran, wafa] = await Promise.all([
    computeTahfidzProgress(student, academicYear, semester),
    computeTahsinAlquranProgress(student, academicYear, semester),
    computeWafaProgress(student, academicYear, semester),
  ]);

  return {
    tahfidz: tahfidz[0]?.progress ?? [],
    tahsinAlquran: tahsinAlquran[0]?.progress ?? [],
    wafa: wafa[0]?.progress ?? [],
  };
}
