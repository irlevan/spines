interface ProgressLike {
  percent: number;
  timestamp: Date | string;
}

// Every ProgressLog is stored as a normalized 0-100 percent (see
// resolvePercent in lib/progress.ts), regardless of whether the reader typed
// a page number or a percent when logging it. This just grabs the latest one.
export function latestProgressPercent(logs: ProgressLike[]): number {
  if (logs.length === 0) return 0;
  const latest = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
  return Math.max(0, Math.min(100, latest.percent));
}

function dayKey(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

// Consecutive days with at least one progress log, counting back from today.
// If nothing was logged today yet, the streak can still count as "alive" as
// long as yesterday has an entry — otherwise logging once in the morning and
// checking the dashboard before logging again at night would show 0.
export function computeStreak(timestamps: (Date | string)[]): number {
  if (timestamps.length === 0) return 0;

  const days = new Set(timestamps.map(dayKey));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
