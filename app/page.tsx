import { prisma } from "@/lib/prisma";
import { computeStreak } from "@/lib/stats";
import StatsDashboard from "@/components/StatsDashboard";
import CurrentlyReading from "@/components/CurrentlyReading";

export default async function DashboardPage() {
  const books = await prisma.book.findMany({
    include: { progressLogs: true },
  });

  const currentYear = new Date().getFullYear();

  const readThisYear = books.filter(
    (b) => b.dateFinished && new Date(b.dateFinished).getFullYear() === currentYear
  );
  const pagesReadThisYear = readThisYear.reduce((sum, b) => sum + (b.pageCount ?? 0), 0);

  const ratedBooks = books.filter((b) => b.rating !== null);
  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating ?? 0), 0) / ratedBooks.length
      : null;

  const allTimestamps = books.flatMap((b) => b.progressLogs.map((l) => l.timestamp));
  const currentStreak = computeStreak(allTimestamps);

  const moodCounts: Record<string, number> = {};
  for (const book of books) {
    for (const tag of book.moodTags) {
      moodCounts[tag] = (moodCounts[tag] ?? 0) + 1;
    }
  }

  const reading = books
    .filter((b) => b.shelf === "reading")
    .sort((a, b) => (b.dateStarted?.getTime() ?? 0) - (a.dateStarted?.getTime() ?? 0));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-subtle">Overview</p>
        <h1 className="font-display text-4xl italic tracking-tight">Dashboard</h1>
      </div>

      <section className="mb-14">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">
          Currently reading
        </h2>
        <CurrentlyReading books={reading} />
      </section>

      <section className="max-w-3xl">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">
          This year
        </h2>
        <StatsDashboard
          booksReadThisYear={readThisYear.length}
          pagesReadThisYear={pagesReadThisYear}
          averageRating={averageRating}
          currentStreak={currentStreak}
          moodCounts={moodCounts}
        />
      </section>
    </main>
  );
}
