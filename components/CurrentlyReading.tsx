"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Book, ProgressLog } from "@prisma/client";
import ProgressRibbon from "./ProgressRibbon";
import { latestProgressPercent } from "@/lib/stats";

interface ReadingBook extends Book {
  progressLogs: ProgressLog[];
}

interface CurrentlyReadingProps {
  books: ReadingBook[];
}

export default function CurrentlyReading({ books }: CurrentlyReadingProps) {
  const [entries, setEntries] = useState(books);

  async function handleUpdate(bookId: string, unit: "pages" | "percent", value: string) {
    const parsed = Number(value);
    if (!value || Number.isNaN(parsed)) return;

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, unit, value: parsed }),
    });
    if (!res.ok) return;
    const log: ProgressLog = await res.json();
    setEntries((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, progressLogs: [...b.progressLogs, log] } : b))
    );
  }

  if (entries.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-1 px-6 py-10 text-center">
        <p className="font-display text-xl italic text-muted">Nothing open right now.</p>
        <p className="text-sm text-subtle">
          Move a book to &ldquo;Reading&rdquo; from your library to track it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((book) => {
        const percent = latestProgressPercent(book.progressLogs);
        const unit: "pages" | "percent" = book.pageCount ? "pages" : "percent";
        return (
          <div key={book.id} className="card flex gap-4 p-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-surface-2 shadow-sm">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={`${book.title} cover`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-xs italic text-subtle">
                  No cover
                </div>
              )}
              <ProgressRibbon percent={percent} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <Link
                  href={`/book/${book.id}`}
                  className="line-clamp-1 font-medium leading-snug transition-colors hover:text-ribbon"
                >
                  {book.title}
                </Link>
                <p className="line-clamp-1 text-sm text-muted">{book.author}</p>
                <p className="font-data mt-1 text-xs text-subtle">{Math.round(percent)}% read</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    "value"
                  ) as HTMLInputElement;
                  handleUpdate(book.id, unit, input.value);
                  input.value = "";
                }}
                className="mt-2 flex gap-1.5"
              >
                <input
                  name="value"
                  type="number"
                  placeholder={unit === "pages" ? "Page" : "%"}
                  className="input w-full min-w-0 rounded-md px-2 py-1 text-xs"
                />
                <button
                  type="submit"
                  className="btn-ribbon shrink-0 rounded-md px-2.5 py-1 text-xs font-medium"
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
