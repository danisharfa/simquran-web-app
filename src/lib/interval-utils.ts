export interface Interval {
  start: number;
  end: number;
}

/** Sorts and merges overlapping/adjacent intervals so coverage isn't double-counted. */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];

  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [sorted[0]];

  for (const current of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (current.start <= last.end + 1) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

export function overlapLength(required: Interval, actual: Interval): number {
  const start = Math.max(required.start, actual.start);
  const end = Math.min(required.end, actual.end);
  return start <= end ? end - start + 1 : 0;
}
