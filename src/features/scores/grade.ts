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

const GRADE_ADVERB: Record<GradeLetter, string> = {
  A: 'Sangat baik',
  B: 'Baik',
  C: 'Cukup',
  D: 'Kurang',
};

export function generateTahfidzDescription(grade: GradeLetter, surahName: string): string {
  return `${GRADE_ADVERB[grade]} dalam menghafal ${surahName}`;
}

export function generateTahsinDescription(grade: GradeLetter, topic: string): string {
  return `${GRADE_ADVERB[grade]} dalam memahami ${topic}`;
}
