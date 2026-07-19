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

  return (
    <div className="flex flex-col gap-8">
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
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Mood breakdown
        </h2>
        {moodEntries.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {moodEntries.map(([tag, count]) => (
              <li key={tag} className="flex items-center justify-between text-sm">
                <span>{tag}</span>
                <span className="text-black/40 dark:text-white/40">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-black/40 dark:text-white/40">No mood tags yet.</p>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-black/50 dark:text-white/50">{label}</p>
    </div>
  );
}
