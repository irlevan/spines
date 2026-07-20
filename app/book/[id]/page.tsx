import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProgressLogger from "@/components/ProgressLogger";
import BookMetaEditor from "@/components/BookMetaEditor";
import QuotesEditor from "@/components/QuotesEditor";

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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
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
            <div className="flex h-full items-center justify-center font-display text-xs text-subtle">
              No cover
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{book.title}</h1>
          <p className="mt-1 text-muted">{book.author}</p>
          {book.pageCount ? <p className="mt-1 text-sm text-subtle">{book.pageCount} pages</p> : null}
        </div>
      </div>

      <section className="card mt-10 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-subtle">Progress</h2>
        <ProgressLogger bookId={book.id} initialLogs={book.progressLogs} />
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
