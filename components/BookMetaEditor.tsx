"use client";

import { useRef, useState } from "react";
import type { Book } from "@prisma/client";

const PACE_TAGS = ["fast", "medium", "slow"] as const;

interface BookMetaEditorProps {
  book: Book;
}

function toDateInput(d: Date | string | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

async function patchBook(bookId: string, data: Record<string, unknown>) {
  await fetch(`/api/books/${bookId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export default function BookMetaEditor({ book }: BookMetaEditorProps) {
  const [rating, setRating] = useState(book.rating ?? 0);
  const [moodTags, setMoodTags] = useState<string[]>(book.moodTags);
  const [moodInput, setMoodInput] = useState("");
  const [paceTag, setPaceTag] = useState(book.paceTag ?? "");
  const [reviewText, setReviewText] = useState(book.reviewText ?? "");
  const [savedReview, setSavedReview] = useState(book.reviewText ?? "");
  const [dateStarted, setDateStarted] = useState(toDateInput(book.dateStarted));
  const [dateFinished, setDateFinished] = useState(toDateInput(book.dateFinished));

  // Serialize PATCH requests so two edits fired close together (e.g. adding two
  // mood tags in a row) can't resolve out of order and have the earlier one
  // clobber the later one's write.
  const patchQueueRef = useRef<Promise<void>>(Promise.resolve());
  function queuePatch(data: Record<string, unknown>) {
    patchQueueRef.current = patchQueueRef.current.then(() => patchBook(book.id, data));
  }

  function handleRate(value: number) {
    setRating(value);
    queuePatch({ rating: value });
  }

  function addMoodTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const tag = moodInput.trim();
    if (!tag || moodTags.includes(tag)) return;
    const next = [...moodTags, tag];
    setMoodTags(next);
    setMoodInput("");
    queuePatch({ moodTags: next });
  }

  function removeMoodTag(tag: string) {
    const next = moodTags.filter((t) => t !== tag);
    setMoodTags(next);
    queuePatch({ moodTags: next });
  }

  function handlePaceTag(value: string) {
    setPaceTag(value);
    queuePatch({ paceTag: value || null });
  }

  function saveReview() {
    setSavedReview(reviewText);
    queuePatch({ reviewText });
  }

  function handleDateStarted(value: string) {
    setDateStarted(value);
    queuePatch({ dateStarted: value || null });
  }

  function handleDateFinished(value: string) {
    setDateFinished(value);
    queuePatch({ dateFinished: value || null });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">Dates</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Started
            <input
              type="date"
              value={dateStarted}
              onChange={(e) => handleDateStarted(e.target.value)}
              className="input rounded-lg px-2.5 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Finished
            <input
              type="date"
              value={dateFinished}
              onChange={(e) => handleDateFinished(e.target.value)}
              className="input rounded-lg px-2.5 py-1.5 text-sm text-foreground"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">Rating</p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRate(value)}
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              className={`text-3xl leading-none transition-transform hover:scale-110 ${
                value <= rating ? "text-ribbon" : "text-line"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">Mood tags</p>
        <div className="flex flex-wrap items-center gap-2">
          {moodTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeMoodTag(tag)}
                aria-label={`Remove ${tag}`}
                className="text-subtle hover:text-ribbon"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={moodInput}
            onChange={(e) => setMoodInput(e.target.value)}
            onKeyDown={addMoodTag}
            placeholder="Add a tag, press Enter"
            className="input w-40 rounded-full px-3 py-1 text-xs text-foreground"
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">Pace</p>
        <select
          value={paceTag}
          onChange={(e) => handlePaceTag(e.target.value)}
          className="input rounded-lg px-2.5 py-1.5 text-sm text-foreground"
        >
          <option value="">—</option>
          {PACE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">Review</p>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          onBlur={saveReview}
          rows={4}
          placeholder="What did you think?"
          className="input w-full rounded-lg px-3 py-2 text-sm text-foreground"
        />
        {reviewText !== savedReview ? (
          <button
            type="button"
            onClick={saveReview}
            className="btn-ribbon mt-2 rounded-lg px-3.5 py-1.5 text-xs font-medium"
          >
            Save review
          </button>
        ) : null}
      </div>
    </div>
  );
}
