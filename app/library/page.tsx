import { prisma } from "@/lib/prisma";
import ShelfView from "@/components/ShelfView";

export default async function LibraryPage() {
  const books = await prisma.book.findMany({ orderBy: { dateAdded: "desc" } });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Library</h1>
      <ShelfView initialBooks={books} />
    </main>
  );
}
