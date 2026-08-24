export function formatTashihDetail(request: {
  tashihType: string;
  juz: { name: string } | null;
  surah: { name: string } | null;
  wafa: { name: string } | null;
  startPage: number | null;
  endPage: number | null;
}): string {
  if (request.tashihType === 'WAFA') {
    return `${request.wafa?.name ?? '-'} hal. ${request.startPage}-${request.endPage}`;
  }
  return `${request.juz?.name ?? '-'} - ${request.surah?.name ?? '-'}`;
}
