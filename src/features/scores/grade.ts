import type { GradeLetter } from '@/lib/generated/prisma/enums';

export function computeGrade(score: number): GradeLetter {
  if (score >= 92) return 'A';
  if (score >= 83) return 'B';
  if (score >= 75) return 'C';
  return 'D';
}

export const GRADE_DESCRIPTION: Record<GradeLetter, string> = {
  A: 'Sangat Baik',
  B: 'Baik',
  C: 'Cukup',
  D: 'Kurang',
};
