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
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or author…"
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm placeholder:text-subtle focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {results.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
          {results.map((r) => (
            <div key={r.openLibraryKey} className="flex items-center justify-between gap-3 text-sm">
              <span>
                {r.title} <span className="text-muted">— {r.author}</span>
              </span>
              <button
                onClick={() => handleAdd(r)}
                className="shrink-0 rounded-lg border border-line px-2 py-1 text-xs hover:border-accent hover:text-accent"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SHELVES.map((shelf) => (
          <div key={shelf.value} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {shelf.label} ({books.filter((b) => b.shelf === shelf.value).length})
            </h2>
            <div className="flex flex-col gap-3">
              {books
                .filter((b) => b.shelf === shelf.value)
                .map((book) => (
                  <BookCard key={book.id} book={book} onShelfChange={handleShelfChange} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
