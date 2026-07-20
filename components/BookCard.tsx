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
    <div className="card card-hover flex gap-3 p-3">
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2 shadow-sm">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`${book.title} cover`}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-xs text-subtle">
            No cover
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/book/${book.id}`}
            className="font-medium leading-snug transition-colors hover:text-accent"
          >
            {book.title}
          </Link>
          <p className="text-sm text-muted">{book.author}</p>
          {book.pageCount ? <p className="text-xs text-subtle">{book.pageCount} pages</p> : null}
        </div>
        <select
          value={book.shelf}
          onChange={(e) => onShelfChange(book.id, e.target.value)}
          className="input mt-2 w-fit rounded-md px-2 py-1 text-xs text-foreground"
        >
          {SHELVES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
