import { prisma } from "@/lib/prisma";
import ShelfView from "@/components/ShelfView";

export default async function LibraryPage() {
  const books = await prisma.book.findMany({ orderBy: { dateAdded: "desc" } });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-subtle">
          {books.length} {books.length === 1 ? "book" : "books"}
        </p>
        <h1 className="font-display text-4xl italic tracking-tight">Library</h1>
      </div>
      <ShelfView initialBooks={books} />
    </main>
  );
}
