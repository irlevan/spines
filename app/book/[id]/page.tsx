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
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex gap-6">
        <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-lg bg-line">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`${book.title} cover`}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{book.title}</h1>
          <p className="text-muted">{book.author}</p>
          {book.pageCount ? <p className="text-sm text-subtle">{book.pageCount} pages</p> : null}
        </div>
      </div>

      <section className="mt-8 border-t border-line pt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Progress</h2>
        <ProgressLogger bookId={book.id} initialLogs={book.progressLogs} />
      </section>

      <section className="mt-8 border-t border-line pt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Rating &amp; Review
        </h2>
        <BookMetaEditor book={book} />
      </section>

      <section className="mt-8 border-t border-line pt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Quotes</h2>
        <QuotesEditor bookId={book.id} initialQuotes={book.quotes} />
      </section>
    </main>
  );
}
