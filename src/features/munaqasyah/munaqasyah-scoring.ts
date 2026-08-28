import type { MunaqasyahGrade } from '@/lib/generated/prisma/enums';

const round1 = (n: number) => parseFloat(n.toFixed(1));

export interface ScoringWeights {
  khofiAwalAyatWeight: number;
  khofiMakhrojWeight: number;
  khofiTajwidMadWeight: number;
  jaliBarisWeight: number;
  jaliLebihSatuKalimatWeight: number;
}

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

export interface MunaqasyahGradeSettingData {
  grade: MunaqasyahGrade;
  minScore: number;
  label: string;
}

export function scoreToGrade(score: number, settings: MunaqasyahGradeSettingData[]): MunaqasyahGrade {
  const sorted = [...settings].sort((a, b) => b.minScore - a.minScore);
  const match = sorted.find((s) => score >= s.minScore);
  return (match ?? sorted[sorted.length - 1])?.grade ?? 'TIDAK_LULUS';
}

export function buildGradeLabelMap(settings: MunaqasyahGradeSettingData[]): Record<MunaqasyahGrade, string> {
  return Object.fromEntries(settings.map((s) => [s.grade, s.label])) as Record<MunaqasyahGrade, string>;
}

export function isPassing(grade: MunaqasyahGrade): boolean {
  return grade !== 'TIDAK_LULUS';
}

export function getKkm(settings: MunaqasyahGradeSettingData[]): number {
  return settings.find((s) => s.grade === 'JAYYID')?.minScore ?? 0;
}

function calculateDeduction(
  row: {
    khofiAwalAyat: number;
    khofiMakhroj: number;
    khofiTajwidMad: number;
    jaliBaris: number;
    jaliLebihSatuKalimat: number;
  },
  weights: ScoringWeights,
): number {
  return (
    row.khofiAwalAyat * weights.khofiAwalAyatWeight +
    row.khofiMakhroj * weights.khofiMakhrojWeight +
    row.khofiTajwidMad * weights.khofiTajwidMadWeight +
    row.jaliBaris * weights.jaliBarisWeight +
    row.jaliLebihSatuKalimat * weights.jaliLebihSatuKalimatWeight
  );
}

export function calculateTasmiRawTotal(row: TasmiDetailInput, weights: ScoringWeights): number {
  const rawScore = row.initialScore - calculateDeduction(row, weights);
  return Math.max(0, rawScore);
}

export function calculateTasmiPercentage(row: TasmiDetailInput, weights: ScoringWeights): number {
  const rawTotal = calculateTasmiRawTotal(row, weights);
  return row.initialScore > 0 ? (rawTotal / row.initialScore) * 100 : 0;
}

export function calculateTasmiTotalScore(tasmiDetails: TasmiDetailInput[], weights: ScoringWeights) {
  const detailsToSave = tasmiDetails.map((detail) => {
    const percentageRounded = round1(calculateTasmiPercentage(detail, weights));
    return { ...detail, totalScore: percentageRounded };
  });

  const avgPercent =
    detailsToSave.reduce((sum, d) => sum + d.totalScore, 0) / (detailsToSave.length || 1);
  const totalScore = round1(clamp100(avgPercent));

  return { totalScore, detailsToSave };
}

const MUNAQASYAH_BASE_SCORE = 50;

export function calculateMunaqasyahRawTotal(row: MunaqasyahDetailInput, weights: ScoringWeights): number {
  const rawScore = MUNAQASYAH_BASE_SCORE - calculateDeduction(row, weights);
  return Math.max(0, rawScore);
}

export function calculateMunaqasyahPercentage(row: MunaqasyahDetailInput, weights: ScoringWeights): number {
  return (calculateMunaqasyahRawTotal(row, weights) / MUNAQASYAH_BASE_SCORE) * 100;
}

export function calculateMunaqasyahTotalScore(munaqasyahDetails: MunaqasyahDetailInput[], weights: ScoringWeights) {
  if (munaqasyahDetails.length !== 5) {
    throw new Error('Munaqasyah harus terdiri dari 5 soal');
  }

  const detailsToSave = munaqasyahDetails.map((detail) => {
    const rawTotal = calculateMunaqasyahRawTotal(detail, weights);
    return { ...detail, initialScore: MUNAQASYAH_BASE_SCORE, totalScore: rawTotal };
  });

  const questionScores = munaqasyahDetails.map((detail) => calculateMunaqasyahPercentage(detail, weights));
  const avgPercent = questionScores.reduce((a, b) => a + b, 0) / questionScores.length;
  const totalScore = round1(clamp100(avgPercent));

  return { totalScore, detailsToSave };
}

export interface FinalScoreWeights {
  tasmiWeight: number;
  munaqasyahWeight: number;
}

export function calculateFinalScore(tasmiScore: number, munaqasyahScore: number, weights: FinalScoreWeights): number {
  return round1(
    clamp100(tasmiScore * (weights.tasmiWeight / 100) + munaqasyahScore * (weights.munaqasyahWeight / 100)),
  );
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
