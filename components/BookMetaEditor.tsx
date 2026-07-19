"use client";

import { useRef, useState } from "react";
import type { Book } from "@prisma/client";

const PACE_TAGS = ["fast", "medium", "slow"] as const;

interface BookMetaEditorProps {
  book: Book;
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
          Rating
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRate(value)}
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              className={`text-2xl leading-none ${
                value <= rating ? "text-yellow-500" : "text-black/20 dark:text-white/20"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
          Mood tags
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {moodTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full border border-black/10 px-2 py-0.5 text-xs dark:border-white/10"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeMoodTag(tag)}
                aria-label={`Remove ${tag}`}
                className="text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
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
            className="w-40 rounded border border-black/10 bg-transparent px-2 py-1 text-xs dark:border-white/10"
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
          Pace
        </p>
        <select
          value={paceTag}
          onChange={(e) => handlePaceTag(e.target.value)}
          className="rounded border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
        >
          <option value="" className="text-black">
            —
          </option>
          {PACE_TAGS.map((tag) => (
            <option key={tag} value={tag} className="text-black">
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
          Review
        </p>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          onBlur={saveReview}
          rows={4}
          placeholder="What did you think?"
          className="w-full rounded border border-black/10 bg-transparent px-2 py-1.5 text-sm dark:border-white/10"
        />
        {reviewText !== savedReview ? (
          <button
            type="button"
            onClick={saveReview}
            className="mt-2 rounded bg-foreground px-3 py-1.5 text-xs font-medium text-background"
          >
            Save review
          </button>
        ) : null}
      </div>
    </div>
  );
}
