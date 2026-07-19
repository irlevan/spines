import { prisma } from "@/lib/prisma";
import { computeStreak } from "@/lib/stats";
import StatsDashboard from "@/components/StatsDashboard";

export default async function DashboardPage() {
  const [books, progressLogs] = await Promise.all([
    prisma.book.findMany(),
    prisma.progressLog.findMany({ select: { timestamp: true } }),
  ]);

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

  const currentStreak = computeStreak(progressLogs.map((l) => l.timestamp));

  const moodCounts: Record<string, number> = {};
  for (const book of books) {
    for (const tag of book.moodTags) {
      moodCounts[tag] = (moodCounts[tag] ?? 0) + 1;
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Dashboard</h1>
      <StatsDashboard
        booksReadThisYear={readThisYear.length}
        pagesReadThisYear={pagesReadThisYear}
        averageRating={averageRating}
        currentStreak={currentStreak}
        moodCounts={moodCounts}
      />
    </main>
  );
}
