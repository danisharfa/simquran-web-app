'use server';

import { prisma } from '@/lib/prisma';
import { requireRoleOrThrow } from '@/lib/require-role';

export interface SubmissionDetail {
  id: string;
  studentId: string;
  groupId: string;
  date: Date;
  submissionType: 'TAHFIDZ' | 'TAHSIN_WAFA' | 'TAHSIN_ALQURAN';
  juzId: number | null;
  surahId: number | null;
  startVerse: number | null;
  endVerse: number | null;
  wafaId: number | null;
  startPage: number | null;
  endPage: number | null;
  adab: 'BAIK' | 'KURANG_BAIK' | 'TIDAK_BAIK';
  submissionStatus: 'LULUS' | 'TIDAK_LULUS' | 'MENGULANG';
  note: string | null;
}

export async function getSubmission(submissionId: string): Promise<SubmissionDetail> {
  const session = await requireRoleOrThrow(['teacher']);

  const submission = await prisma.submission.findUniqueOrThrow({ where: { id: submissionId } });

  if (submission.teacherId !== session.user.id) {
    throw new Error('Forbidden: tidak memiliki akses ke setoran ini');
  }

  return submission;
}
