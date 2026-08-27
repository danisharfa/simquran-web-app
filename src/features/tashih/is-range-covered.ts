interface Interval {
  start: number;
  end: number;
}

/** True if the union of `ranges` fully covers [requiredStart, requiredEnd] without gaps. */
export function isRangeFullyCovered(
  requiredStart: number,
  requiredEnd: number,
  ranges: Interval[],
): boolean {
  const clipped = ranges
    .map((r) => ({ start: Math.max(r.start, requiredStart), end: Math.min(r.end, requiredEnd) }))
    .filter((r) => r.start <= r.end)
    .sort((a, b) => a.start - b.start);

  let coveredUpTo = requiredStart - 1;
  for (const r of clipped) {
    if (r.start > coveredUpTo + 1) return false;
    coveredUpTo = Math.max(coveredUpTo, r.end);
    if (coveredUpTo >= requiredEnd) return true;
  }

  return coveredUpTo >= requiredEnd;
}
