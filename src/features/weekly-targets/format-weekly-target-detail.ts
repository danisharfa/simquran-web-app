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

  const parts: string[] = [];

  if (target.juzStart) {
    parts.push(
      target.juzStart.name === target.juzEnd?.name
        ? target.juzStart.name
        : `${target.juzStart.name}-${target.juzEnd?.name ?? '-'}`,
    );
  }

  if (target.surahStart) {
    parts.push(
      target.surahStart.name === target.surahEnd?.name
        ? target.surahStart.name
        : `${target.surahStart.name}-${target.surahEnd?.name ?? '-'}`,
    );
  }

  const ayat = target.startAyat === target.endAyat ? `${target.startAyat}` : `${target.startAyat}-${target.endAyat}`;
  parts.push(`ayat ${ayat}`);

  return parts.join(', ');
}
