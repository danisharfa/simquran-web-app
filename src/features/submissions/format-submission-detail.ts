export function formatSubmissionDetail(submission: {
  submissionType: string;
  surah: { name: string } | null;
  startVerse: number | null;
  endVerse: number | null;
  wafa: { name: string } | null;
  startPage: number | null;
  endPage: number | null;
}): string {
  if (submission.submissionType === 'TAHSIN_WAFA') {
    return `${submission.wafa?.name ?? '-'} hal. ${submission.startPage}-${submission.endPage}`;
  }
  return `${submission.surah?.name ?? '-'} ayat ${submission.startVerse}-${submission.endVerse}`;
}
