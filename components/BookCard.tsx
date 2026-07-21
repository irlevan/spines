"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Book } from "@prisma/client";
import FavoriteButton from "./FavoriteButton";

export const SHELVES: { value: string; label: string }[] = [
  { value: "want_to_read", label: "Want to Read" },
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
  { value: "dnf", label: "DNF" },
];

interface BookCardProps {
  book: Book;
  onShelfChange: (bookId: string, shelf: string) => void;
  onRemove: (bookId: string) => void;
  onFavoriteToggle?: (bookId: string, favorite: boolean) => void;
  dragHandle?: React.ReactNode;
}

export default function BookCard({
  book,
  onShelfChange,
  onRemove,
  onFavoriteToggle,
  dragHandle,
}: BookCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="card card-hover group relative flex flex-col overflow-hidden">
      {dragHandle}
      <div className="relative flex gap-3 p-3 pt-2.5">
        {confirming ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-b-[0.875rem] bg-surface/95 p-3 text-center backdrop-blur-sm">
            <p className="text-xs text-muted">Remove &ldquo;{book.title}&rdquo; for good?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onRemove(book.id)}
                className="rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-on-ribbon"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-md border border-line px-2.5 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`${book.title} cover`}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-xs italic text-subtle">
              No cover
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start gap-1.5">
              <Link
                href={`/book/${book.id}`}
                className="line-clamp-2 font-medium leading-snug transition-colors hover:text-ribbon"
              >
                {book.title}
              </Link>
              <FavoriteButton
                bookId={book.id}
                initialFavorite={book.favorite}
                className="mt-0.5 shrink-0"
                onToggle={onFavoriteToggle}
              />
            </div>
            <p className="line-clamp-1 text-sm text-muted">{book.author}</p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <select
              value={book.shelf}
              onChange={(e) => onShelfChange(book.id, e.target.value)}
              className="input w-fit rounded-md px-2 py-1 text-xs text-foreground"
            >
              {SHELVES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Remove ${book.title}`}
              className="shrink-0 rounded-full p-1 text-subtle opacity-0 transition-opacity hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path
                  d="M5 6h10M8.5 6V4.5h3V6M6 6l.5 9.5a1 1 0 0 0 1 .95h5a1 1 0 0 0 1-.95L14 6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
