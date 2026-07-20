interface StatsDashboardProps {
  booksReadThisYear: number;
  pagesReadThisYear: number;
  averageRating: number | null;
  currentStreak: number;
  moodCounts: Record<string, number>;
}

export default function StatsDashboard({
  booksReadThisYear,
  pagesReadThisYear,
  averageRating,
  currentStreak,
  moodCounts,
}: StatsDashboardProps) {
  const moodEntries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const maxMoodCount = moodEntries.length > 0 ? moodEntries[0][1] : 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Books read this year" value={booksReadThisYear} />
        <StatTile label="Pages read this year" value={pagesReadThisYear} />
        <StatTile
          label="Average rating"
          value={averageRating !== null ? averageRating.toFixed(1) : "—"}
        />
        <StatTile label="Current streak" value={`${currentStreak}d`} />
      </div>

      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">
          Mood breakdown
        </h2>
        {moodEntries.length > 0 ? (
          <div className="card flex flex-col gap-3 p-5">
            {moodEntries.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate capitalize">{tag}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
                    style={{ width: `${Math.max((count / maxMoodCount) * 100, 8)}%` }}
                  />
                </div>
                <span className="w-5 shrink-0 text-right text-subtle">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center text-sm text-subtle">No mood tags yet.</div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="font-display text-3xl font-semibold text-accent">{value}</p>
      <p className="mt-1.5 text-xs text-muted">{label}</p>
    </div>
  );
}
