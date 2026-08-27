export function formatWeeklyTargetDetail(target: {
  type: string;
  juzStart: { name: string } | null;
  juzEnd: { name: string } | null;
  surahStart: { name: string } | null;
  surahEnd: { name: string } | null;
  startAyat: number | null;
  endAyat: number | null;
  wafa: { name: string } | null;
  startPage: number | null;
  endPage: number | null;
}): string {
  if (target.type === 'TAHSIN_WAFA') {
    const pages = target.startPage === target.endPage ? `${target.startPage}` : `${target.startPage}-${target.endPage}`;
    return `${target.wafa?.name ?? '-'} hal. ${pages}`;
  }

  if (!target.surahStart || !target.surahEnd) return '-';

  const juzLabel = target.juzStart
    ? target.juzStart.name === target.juzEnd?.name
      ? `${target.juzStart.name} — `
      : `${target.juzStart.name}-${target.juzEnd?.name ?? '-'} — `
    : '';

  // Same surah: "ayat 1-3". Cross-surah: spell out each end so the reading direction is unambiguous
  // (surah mulai can have a higher id than surah akhir, e.g. An-Nas ayat 1 s.d. Al-Falaq ayat 3).
  const range =
    target.surahStart.name === target.surahEnd.name
      ? `${target.surahStart.name} ayat ${
          target.startAyat === target.endAyat ? target.startAyat : `${target.startAyat}-${target.endAyat}`
        }`
      : `${target.surahStart.name} ayat ${target.startAyat} s.d. ${target.surahEnd.name} ayat ${target.endAyat}`;

  return `${juzLabel}${range}`;
}
