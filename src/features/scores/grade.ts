import type { GradeLetter } from '@/lib/generated/prisma/enums';

export interface GradeLetterSettingData {
  grade: GradeLetter;
  minScore: number;
  description: string;
}

export function computeGrade(score: number, settings: GradeLetterSettingData[]): GradeLetter {
  const sorted = [...settings].sort((a, b) => b.minScore - a.minScore);
  const match = sorted.find((s) => score >= s.minScore);
  return (match ?? sorted[sorted.length - 1])?.grade ?? 'D';
}

export function buildGradeDescriptionMap(settings: GradeLetterSettingData[]): Record<GradeLetter, string> {
  return Object.fromEntries(settings.map((s) => [s.grade, s.description])) as Record<GradeLetter, string>;
}

export interface GradeLegendRow {
  grade: GradeLetter;
  range: string;
  description: string;
}

export function buildGradeLegend(settings: GradeLetterSettingData[]): GradeLegendRow[] {
  const sorted = [...settings].sort((a, b) => b.minScore - a.minScore);

  return sorted.map((s, i) => {
    if (i === 0) return { grade: s.grade, range: `${s.minScore}-100`, description: s.description };
    if (i === sorted.length - 1) {
      return { grade: s.grade, range: `< ${sorted[i - 1].minScore}`, description: s.description };
    }
    return { grade: s.grade, range: `${s.minScore}-${sorted[i - 1].minScore - 1}`, description: s.description };
  });
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

export function generateTahfidzDescription(
  grade: GradeLetter,
  surahName: string,
  template: string,
  descriptionMap: Record<GradeLetter, string>,
): string {
  return fillTemplate(template, { grade, description: descriptionMap[grade], surahName });
}

export function generateTahsinDescription(
  grade: GradeLetter,
  topic: string,
  template: string,
  descriptionMap: Record<GradeLetter, string>,
): string {
  return fillTemplate(template, { grade, description: descriptionMap[grade], topic });
}
