import type { ReferenceOption, SurahJuzMapping } from './queries/list-reference-options';

export function filterSurahOptionsByJuz(
  surahOptions: ReferenceOption[],
  surahJuzMap: SurahJuzMapping[],
  juzId: number | null,
): ReferenceOption[] {
  if (!juzId) return surahOptions;
  const allowedSurahIds = new Set(surahJuzMap.filter((m) => m.juzId === juzId).map((m) => m.surahId));
  return surahOptions.filter((s) => allowedSurahIds.has(s.id));
}
