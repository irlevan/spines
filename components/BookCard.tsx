"use client";

import Image from "next/image";
import Link from "next/link";
import type { Book } from "@prisma/client";

export const SHELVES: { value: string; label: string }[] = [
  { value: "want_to_read", label: "Want to Read" },
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
  { value: "dnf", label: "DNF" },
];

interface BookCardProps {
  book: Book;
  onShelfChange: (bookId: string, shelf: string) => void;
}

export default function BookCard({ book, onShelfChange }: BookCardProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-black/10 p-3 dark:border-white/10">
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded bg-black/5 dark:bg-white/5">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`${book.title} cover`}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/book/${book.id}`} className="font-medium hover:underline">
            {book.title}
          </Link>
          <p className="text-sm text-black/60 dark:text-white/60">{book.author}</p>
          {book.pageCount ? (
            <p className="text-xs text-black/40 dark:text-white/40">{book.pageCount} pages</p>
          ) : null}
        </div>
        <select
          value={book.shelf}
          onChange={(e) => onShelfChange(book.id, e.target.value)}
          className="mt-2 w-fit rounded border border-black/10 bg-transparent px-2 py-1 text-xs dark:border-white/10"
        >
          {SHELVES.map((s) => (
            <option key={s.value} value={s.value} className="text-black">
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
