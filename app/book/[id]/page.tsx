import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { latestProgressPercent } from "@/lib/stats";
import ProgressLogger from "@/components/ProgressLogger";
import ProgressRibbon from "@/components/ProgressRibbon";
import BookMetaEditor from "@/components/BookMetaEditor";
import QuotesEditor from "@/components/QuotesEditor";
import FavoriteButton from "@/components/FavoriteButton";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { progressLogs: true, quotes: true },
  });

  if (!book) notFound();

  const percent = latestProgressPercent(book.progressLogs);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <div className="flex gap-6">
        <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-xl bg-surface-2 shadow-lg shadow-black/10">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`${book.title} cover`}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-xs italic text-subtle">
              No cover
            </div>
          )}
          {book.shelf === "reading" ? <ProgressRibbon percent={percent} /> : null}
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl italic tracking-tight">{book.title}</h1>
            <FavoriteButton bookId={book.id} initialFavorite={book.favorite} size="lg" />
          </div>
          <p className="mt-1.5 text-muted">{book.author}</p>
          {book.pageCount ? (
            <p className="font-data mt-1 text-sm text-subtle">
              {book.pageCount} pages{book.publisher ? ` · ${book.publisher}` : ""}
            </p>
          ) : book.publisher ? (
            <p className="mt-1 text-sm text-subtle">{book.publisher}</p>
          ) : null}
        </div>
      </div>

      <section className="card mt-10 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">Progress</h2>
        <ProgressLogger bookId={book.id} initialLogs={book.progressLogs} pageCount={book.pageCount} />
      </section>

      <section className="card mt-6 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">
          Rating &amp; Review
        </h2>
        <BookMetaEditor book={book} />
      </section>

      <section className="card mt-6 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">Quotes</h2>
        <QuotesEditor bookId={book.id} initialQuotes={book.quotes} />
      </section>
    </main>
  );
}
