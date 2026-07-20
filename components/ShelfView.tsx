"use client";

import { useState } from "react";
import type { Book } from "@prisma/client";
import BookCard, { SHELVES } from "./BookCard";

interface OpenLibraryResult {
  title: string;
  author: string;
  isbn: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  openLibraryKey: string;
}

interface ShelfViewProps {
  initialBooks: Book[];
}

export default function ShelfView({ initialBooks }: ShelfViewProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenLibraryResult[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
      const data: OpenLibraryResult[] = await res.json();
      setResults(data);
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(result: OpenLibraryResult) {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: result.title,
        author: result.author,
        isbn: result.isbn,
        coverUrl: result.coverUrl,
        pageCount: result.pageCount,
        shelf: "want_to_read",
      }),
    });
    const book: Book = await res.json();
    setBooks((prev) => [book, ...prev]);
    setResults((prev) => prev.filter((r) => r.openLibraryKey !== result.openLibraryKey));
  }

  async function handleShelfChange(bookId: string, shelf: string) {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, shelf } : b)));
    await fetch(`/api/books/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelf }),
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
          >
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author…"
            className="input w-full rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:text-subtle"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="btn-accent shrink-0 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {results.length > 0 ? (
        <div className="card flex flex-col divide-y divide-line p-2">
          {results.map((r) => (
            <div
              key={r.openLibraryKey}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <span>
                {r.title} <span className="text-muted">— {r.author}</span>
              </span>
              <button
                onClick={() => handleAdd(r)}
                className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {SHELVES.map((shelf) => (
          <div key={shelf.value} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-subtle">
              {shelf.label}
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                {books.filter((b) => b.shelf === shelf.value).length}
              </span>
            </h2>
            <div className="flex flex-col gap-3">
              {books.filter((b) => b.shelf === shelf.value).length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-subtle">
                  Empty
                </div>
              ) : (
                books
                  .filter((b) => b.shelf === shelf.value)
                  .map((book) => (
                    <BookCard key={book.id} book={book} onShelfChange={handleShelfChange} />
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
