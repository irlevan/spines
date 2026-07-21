"use client";

import { useRef, useState } from "react";

interface ImportResult {
  source: "goodreads" | "storygraph";
  imported: number;
  skipped: number;
}

export default function ImportForm() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Import failed.");
        return;
      }
      setResult(body);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card flex flex-col gap-4 p-6">
      <div>
        <p className="font-medium">Import from Goodreads or StoryGraph</p>
        <p className="mt-0.5 text-sm text-muted">
          Upload the CSV export from either service. Books already in your library (matched by
          title and author) are skipped. New books are enriched with a cover, page count, and
          publisher from Open Library where an ISBN is available - large files may take a
          while to finish.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          required
          className="input flex-1 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={uploading}
          className="btn-ribbon shrink-0 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {uploading ? "Importing…" : "Import"}
        </button>
      </form>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {result ? (
        <p className="text-sm text-muted">
          Detected <span className="font-medium capitalize">{result.source}</span> export -
          imported {result.imported} book{result.imported === 1 ? "" : "s"}
          {result.skipped > 0 ? `, skipped ${result.skipped} already in your library` : ""}.
        </p>
      ) : null}
    </div>
  );
}
