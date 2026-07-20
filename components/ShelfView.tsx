"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Book } from "@prisma/client";
import { SHELVES } from "./BookCard";
import DraggableBookCard from "./DraggableBookCard";
import ShelfColumn from "./ShelfColumn";
import EditionPicker, { type ChosenEdition } from "./EditionPicker";

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
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pickingWork, setPickingWork] = useState<OpenLibraryResult | null>(null);

  const visibleBooks = favoritesOnly ? books.filter((b) => b.favorite) : books;
  const activeBook = activeId ? books.find((b) => b.id === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

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

  async function handleSelectEdition(edition: ChosenEdition) {
    if (!pickingWork) return;
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pickingWork.title,
        author: pickingWork.author,
        isbn: edition.isbn,
        coverUrl: edition.coverUrl,
        pageCount: edition.pageCount,
        publisher: edition.publisher,
        shelf: "want_to_read",
      }),
    });
    const book: Book = await res.json();
    setBooks((prev) => [book, ...prev]);
    setResults((prev) => prev.filter((r) => r.openLibraryKey !== pickingWork.openLibraryKey));
    setPickingWork(null);
  }

  async function handleShelfChange(bookId: string, shelf: string) {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, shelf } : b)));
    await fetch(`/api/books/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelf }),
    });
  }

  async function handleRemove(bookId: string) {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    await fetch(`/api/books/${bookId}`, { method: "DELETE" });
  }

  function handleFavoriteToggle(bookId: string, favorite: boolean) {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, favorite } : b)));
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const shelf = event.over?.id ? String(event.over.id) : null;
    const bookId = String(event.active.id);
    const book = books.find((b) => b.id === bookId);
    if (!shelf || !book || book.shelf === shelf) return;
    handleShelfChange(bookId, shelf);
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
          className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {pickingWork ? (
        <EditionPicker
          workKey={pickingWork.openLibraryKey}
          title={pickingWork.title}
          author={pickingWork.author}
          fallback={{
            coverUrl: pickingWork.coverUrl,
            pageCount: pickingWork.pageCount,
            publisher: null,
            isbn: pickingWork.isbn,
          }}
          onCancel={() => setPickingWork(null)}
          onSelect={handleSelectEdition}
        />
      ) : results.length > 0 ? (
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
                onClick={() => setPickingWork(r)}
                className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:border-ribbon hover:text-ribbon"
              >
                Choose edition
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setFavoritesOnly((prev) => !prev)}
        aria-pressed={favoritesOnly}
        className={`flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          favoritesOnly
            ? "border-lamp bg-lamp/10 text-lamp"
            : "border-line text-muted hover:text-lamp"
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={favoritesOnly ? "currentColor" : "none"}>
          <path
            d="M10 16.5 4.5 12.2C2.2 10.3 2 7 4.2 5.3a4 4 0 0 1 5.7.9l.1.2.1-.2a4 4 0 0 1 5.7-.9c2.2 1.7 2.4 5 .1 6.9L10 16.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Favorites only
      </button>

      <p className="text-xs text-subtle">Drag the grip on a card to move it between shelves, or use its dropdown.</p>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SHELVES.map((shelf) => (
            <div key={shelf.value} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-subtle">
                {shelf.label}
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  {visibleBooks.filter((b) => b.shelf === shelf.value).length}
                </span>
              </h2>
              <ShelfColumn id={shelf.value}>
                {visibleBooks.filter((b) => b.shelf === shelf.value).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-subtle">
                    {favoritesOnly ? "No favorites here" : "Drop a book here"}
                  </div>
                ) : (
                  visibleBooks
                    .filter((b) => b.shelf === shelf.value)
                    .map((book) => (
                      <DraggableBookCard
                        key={book.id}
                        book={book}
                        onShelfChange={handleShelfChange}
                        onRemove={handleRemove}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))
                )}
              </ShelfColumn>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeBook ? (
            <div className="card w-full max-w-[220px] rotate-2 p-3 text-sm font-medium shadow-lg">
              {activeBook.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
