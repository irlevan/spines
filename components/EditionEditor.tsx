"use client";

import { useState } from "react";
import Image from "next/image";
import type { Book } from "@prisma/client";
import EditionPicker, { type ChosenEdition } from "./EditionPicker";

interface OpenLibraryResult {
  title: string;
  author: string;
  isbn: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  openLibraryKey: string;
}

interface EditionEditorProps {
  book: Book;
}

async function patchBook(bookId: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/books/${bookId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function EditionEditor({ book }: EditionEditorProps) {
  const [coverUrl, setCoverUrl] = useState(book.coverUrl);
  const [pageCount, setPageCount] = useState(book.pageCount?.toString() ?? "");
  const [publisher, setPublisher] = useState(book.publisher);
  const [openLibraryKey, setOpenLibraryKey] = useState(book.openLibraryKey);
  const [workResults, setWorkResults] = useState<OpenLibraryResult[] | null>(null);
  const [searchingWork, setSearchingWork] = useState(false);
  const [pickingWorkKey, setPickingWorkKey] = useState<string | null>(null);

  async function handleChangeEdition() {
    if (openLibraryKey) {
      setPickingWorkKey(openLibraryKey);
      return;
    }
    setSearchingWork(true);
    try {
      const res = await fetch(
        `/api/books?q=${encodeURIComponent(`${book.title} ${book.author}`)}`
      );
      const data: OpenLibraryResult[] = await res.json();
      setWorkResults(data);
    } finally {
      setSearchingWork(false);
    }
  }

  async function handleSelectEdition(edition: ChosenEdition) {
    if (!pickingWorkKey) return;
    setCoverUrl(edition.coverUrl);
    setPageCount(edition.pageCount?.toString() ?? "");
    setPublisher(edition.publisher);
    setOpenLibraryKey(pickingWorkKey);
    setPickingWorkKey(null);
    setWorkResults(null);
    await patchBook(book.id, {
      coverUrl: edition.coverUrl,
      pageCount: edition.pageCount,
      publisher: edition.publisher,
      isbn: edition.isbn,
      openLibraryKey: pickingWorkKey,
    });
  }

  function handlePageCountBlur() {
    const parsed = pageCount.trim() === "" ? null : Number(pageCount);
    if (parsed !== null && (Number.isNaN(parsed) || parsed <= 0)) return;
    patchBook(book.id, { pageCount: parsed });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
          {coverUrl ? (
            <Image src={coverUrl} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-xs italic text-subtle">
              No cover
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">{publisher ?? "Unknown publisher"}</p>
          <label className="flex items-center gap-2 text-xs text-muted">
            Page count
            <input
              type="number"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              onBlur={handlePageCountBlur}
              placeholder="Not set"
              className="input w-24 rounded-lg px-2 py-1 text-sm text-foreground"
            />
          </label>
          <button
            type="button"
            onClick={handleChangeEdition}
            disabled={searchingWork}
            className="w-fit rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:border-ribbon hover:text-ribbon disabled:opacity-50"
          >
            {searchingWork ? "Looking up editions…" : "Change edition / cover"}
          </button>
        </div>
      </div>

      {pickingWorkKey ? (
        <EditionPicker
          workKey={pickingWorkKey}
          title={book.title}
          author={book.author}
          fallback={{ coverUrl, pageCount: pageCount ? Number(pageCount) : null, publisher, isbn: book.isbn }}
          onCancel={() => setPickingWorkKey(null)}
          onSelect={handleSelectEdition}
        />
      ) : workResults ? (
        <div className="card flex flex-col divide-y divide-line p-2">
          {workResults.length === 0 ? (
            <p className="p-3 text-sm text-subtle">
              No matches found on Open Library. Set the page count manually above.
            </p>
          ) : (
            workResults.map((r) => (
              <div
                key={r.openLibraryKey}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
              >
                <span>
                  {r.title} <span className="text-muted">- {r.author}</span>
                </span>
                <button
                  onClick={() => setPickingWorkKey(r.openLibraryKey)}
                  className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:border-ribbon hover:text-ribbon"
                >
                  Choose edition
                </button>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() => setWorkResults(null)}
            className="p-2 text-left text-xs text-subtle hover:text-ribbon"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}
