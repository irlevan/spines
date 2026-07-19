"use client";

import { useState } from "react";
import type { Quote } from "@prisma/client";

interface QuotesEditorProps {
  bookId: string;
  initialQuotes: Quote[];
}

export default function QuotesEditor({ bookId, initialQuotes }: QuotesEditorProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          text,
          page: page ? Number(page) : undefined,
          note: note || undefined,
        }),
      });
      const quote: Quote = await res.json();
      setQuotes((prev) => [...prev, quote]);
      setText("");
      setPage("");
      setNote("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Quote text"
          rows={2}
          required
          className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Page (optional)"
            className="w-32 rounded border border-line bg-surface px-2 py-1 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="flex-1 rounded border border-line bg-surface px-2 py-1 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-50"
        >
          Add quote
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {quotes.map((quote) => (
          <li key={quote.id} className="rounded-lg border border-line bg-surface p-3 text-sm">
            <p className="italic">&ldquo;{quote.text}&rdquo;</p>
            <p className="mt-1 text-xs text-subtle">
              {quote.page ? `p. ${quote.page}` : null}
              {quote.page && quote.note ? " · " : null}
              {quote.note ?? null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
