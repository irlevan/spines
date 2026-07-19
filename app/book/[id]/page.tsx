import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProgressLogger from "@/components/ProgressLogger";

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
        <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded bg-black/5 dark:bg-white/5">
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
          <p className="text-black/60 dark:text-white/60">{book.author}</p>
          {book.pageCount ? (
            <p className="text-sm text-black/40 dark:text-white/40">{book.pageCount} pages</p>
          ) : null}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-medium">Progress</h2>
        <ProgressLogger bookId={book.id} initialLogs={book.progressLogs} />
      </section>
    </main>
  );
}
