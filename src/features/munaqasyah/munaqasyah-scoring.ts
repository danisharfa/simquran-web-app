import type { MunaqasyahGrade } from '@/lib/generated/prisma/enums';

const round1 = (n: number) => parseFloat(n.toFixed(1));

export interface TasmiDetailInput {
  surahId: number;
  initialScore: number;
  khofiAwalAyat: number;
  khofiMakhroj: number;
  khofiTajwidMad: number;
  jaliBaris: number;
  jaliLebihSatuKalimat: number;
  note?: string | null;
}

export interface MunaqasyahDetailInput {
  questionNo: number;
  khofiAwalAyat: number;
  khofiMakhroj: number;
  khofiTajwidMad: number;
  jaliBaris: number;
  jaliLebihSatuKalimat: number;
  note?: string | null;
}

export const clamp100 = (value: number): number => Math.max(0, Math.min(100, value));

export function scoreToGrade(score: number): MunaqasyahGrade {
  if (score >= 91) return 'MUMTAZ';
  if (score >= 85) return 'JAYYID_JIDDAN';
  if (score >= 80) return 'JAYYID';
  return 'TIDAK_LULUS';
}

export function calculateTasmiRawTotal(row: TasmiDetailInput): number {
  const totalKhofi = row.khofiAwalAyat + row.khofiMakhroj + row.khofiTajwidMad;
  const totalJali = row.jaliBaris + row.jaliLebihSatuKalimat;
  const rawScore = row.initialScore - 2 * totalKhofi - 5 * totalJali;
  return Math.max(0, rawScore);
}

export function calculateTasmiPercentage(row: TasmiDetailInput): number {
  const rawTotal = calculateTasmiRawTotal(row);
  return row.initialScore > 0 ? (rawTotal / row.initialScore) * 100 : 0;
}

export function calculateTasmiTotalScore(tasmiDetails: TasmiDetailInput[]) {
  const detailsToSave = tasmiDetails.map((detail) => {
    const percentageRounded = round1(calculateTasmiPercentage(detail));
    return { ...detail, totalScore: percentageRounded };
  });

  const avgPercent =
    detailsToSave.reduce((sum, d) => sum + d.totalScore, 0) / (detailsToSave.length || 1);
  const totalScore = round1(clamp100(avgPercent));

  return { totalScore, detailsToSave };
}

export function calculateMunaqasyahRawTotal(row: MunaqasyahDetailInput): number {
  const totalKhofi = row.khofiAwalAyat + row.khofiMakhroj + row.khofiTajwidMad;
  const totalJali = row.jaliBaris + row.jaliLebihSatuKalimat;
  const rawScore = 50 - 2 * totalKhofi - 3 * totalJali;
  return Math.max(0, rawScore);
}

export function calculateMunaqasyahPercentage(row: MunaqasyahDetailInput): number {
  return (calculateMunaqasyahRawTotal(row) / 50) * 100;
}

export function calculateMunaqasyahTotalScore(munaqasyahDetails: MunaqasyahDetailInput[]) {
  if (munaqasyahDetails.length !== 5) {
    throw new Error('Munaqasyah harus terdiri dari 5 soal');
  }

  const detailsToSave = munaqasyahDetails.map((detail) => {
    const rawTotal = calculateMunaqasyahRawTotal(detail);
    return { ...detail, initialScore: 50, totalScore: rawTotal };
  });

  const questionScores = munaqasyahDetails.map((detail) => calculateMunaqasyahPercentage(detail));
  const avgPercent = questionScores.reduce((a, b) => a + b, 0) / questionScores.length;
  const totalScore = round1(clamp100(avgPercent));

  return { totalScore, detailsToSave };
}

export function calculateFinalScore(tasmiScore: number, munaqasyahScore: number): number {
  return round1(clamp100(tasmiScore * 0.7 + munaqasyahScore * 0.3));
}

export function validateTasmiDetails(tasmiDetails: TasmiDetailInput[]): string | null {
  if (tasmiDetails.length === 0) return 'Detail Tasmi kosong';

  for (const detail of tasmiDetails) {
    if (!detail.initialScore || detail.initialScore < 1) return 'Nilai awal Tasmi harus minimal 1';
    if (
      detail.khofiAwalAyat < 0 ||
      detail.khofiMakhroj < 0 ||
      detail.khofiTajwidMad < 0 ||
      detail.jaliBaris < 0 ||
      detail.jaliLebihSatuKalimat < 0
    ) {
      return 'Jumlah kesalahan tidak boleh negatif';
    }
  }

  return null;
}

export function validateMunaqasyahDetails(munaqasyahDetails: MunaqasyahDetailInput[]): string | null {
  if (munaqasyahDetails.length !== 5) return 'Detail Munaqasyah harus 5 soal';

  for (const detail of munaqasyahDetails) {
    if (
      detail.khofiAwalAyat < 0 ||
      detail.khofiMakhroj < 0 ||
      detail.khofiTajwidMad < 0 ||
      detail.jaliBaris < 0 ||
      detail.jaliLebihSatuKalimat < 0
    ) {
      return 'Jumlah kesalahan tidak boleh negatif';
    }
  }

  return null;
}
