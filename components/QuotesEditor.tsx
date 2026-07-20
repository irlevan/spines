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
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Quote text"
          rows={2}
          required
          className="input w-full rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Page (optional)"
            className="input w-32 rounded-lg px-2.5 py-1.5 text-sm text-foreground"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="input flex-1 rounded-lg px-2.5 py-1.5 text-sm text-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-accent w-fit rounded-lg px-3.5 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          Add quote
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {quotes.map((quote) => (
          <li key={quote.id} className="card p-4 text-sm">
            <p className="font-display italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
            <p className="mt-2 text-xs text-subtle">
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
