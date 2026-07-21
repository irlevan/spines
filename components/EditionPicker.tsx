"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface OpenLibraryEdition {
  editionKey: string;
  coverUrl: string | null;
  pageCount: number | null;
  publisher: string | null;
  publishDate: string | null;
  isbn: string | null;
}

export interface ChosenEdition {
  coverUrl: string | null;
  pageCount: number | null;
  publisher: string | null;
  isbn: string | null;
}

interface EditionPickerProps {
  workKey: string;
  title: string;
  author: string;
  fallback: ChosenEdition;
  onCancel: () => void;
  onSelect: (edition: ChosenEdition) => void;
}

export default function EditionPicker({
  workKey,
  title,
  author,
  fallback,
  onCancel,
  onSelect,
}: EditionPickerProps) {
  const [editions, setEditions] = useState<OpenLibraryEdition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/books/editions?workKey=${encodeURIComponent(workKey)}`)
      .then((res) => res.json())
      .then((data: OpenLibraryEdition[]) => {
        if (!cancelled) setEditions(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workKey]);

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted">{author} - choose an edition</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-xs text-subtle hover:text-ribbon"
        >
          Cancel
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-subtle">Looking up editions…</p>
      ) : editions.length === 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2 text-sm">
          <span className="text-muted">No separate edition details found.</span>
          <button
            type="button"
            onClick={() => onSelect(fallback)}
            className="btn-ribbon shrink-0 rounded-md px-3 py-1 text-xs font-medium"
          >
            Add anyway
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {editions.map((edition) => (
            <button
              key={edition.editionKey}
              type="button"
              onClick={() =>
                onSelect({
                  coverUrl: edition.coverUrl ?? fallback.coverUrl,
                  pageCount: edition.pageCount ?? fallback.pageCount,
                  publisher: edition.publisher,
                  isbn: edition.isbn ?? fallback.isbn,
                })
              }
              className="card card-hover flex flex-col items-center gap-1.5 p-2 text-center"
            >
              <div className="relative h-24 w-16 overflow-hidden rounded-md bg-surface-2">
                {edition.coverUrl ?? fallback.coverUrl ? (
                  <Image
                    src={edition.coverUrl ?? fallback.coverUrl ?? ""}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-[10px] italic text-subtle">
                    No cover
                  </div>
                )}
              </div>
              <p className="line-clamp-1 text-xs font-medium">
                {edition.publisher ?? "Unknown publisher"}
              </p>
              <p className="font-data text-[11px] text-subtle">
                {edition.pageCount ? `${edition.pageCount}p` : "-"}
                {edition.publishDate ? ` · ${edition.publishDate}` : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
