"use client";

import { useState } from "react";
import type { ProgressLog } from "@prisma/client";

interface ProgressLoggerProps {
  bookId: string;
  initialLogs: ProgressLog[];
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString();
}

function computePace(logs: ProgressLog[]) {
  if (logs.length < 2) return null;
  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const deltaUnits = last.pageOrPercent - first.pageOrPercent;
  const deltaDays =
    (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) /
    (1000 * 60 * 60 * 24);
  const totalMinutes = sorted.reduce((sum, l) => sum + (l.sessionMinutes ?? 0), 0);

  // Require at least an hour of spread between the first and last log so a
  // pair of entries logged seconds apart doesn't produce a huge, meaningless rate.
  const MIN_DAYS_FOR_PACE = 1 / 24;

  return {
    perDay: deltaDays >= MIN_DAYS_FOR_PACE ? deltaUnits / deltaDays : null,
    perHour: totalMinutes > 0 ? deltaUnits / (totalMinutes / 60) : null,
  };
}

export default function ProgressLogger({ bookId, initialLogs }: ProgressLoggerProps) {
  const [logs, setLogs] = useState<ProgressLog[]>(initialLogs);
  const [pageOrPercent, setPageOrPercent] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pace = computePace(logs);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pageOrPercent) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          pageOrPercent: Number(pageOrPercent),
          sessionMinutes: sessionMinutes ? Number(sessionMinutes) : undefined,
        }),
      });
      const log: ProgressLog = await res.json();
      setLogs((prev) => [...prev, log]);
      setPageOrPercent("");
      setSessionMinutes("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-xs text-black/60 dark:text-white/60">
          Page or %
          <input
            type="number"
            value={pageOrPercent}
            onChange={(e) => setPageOrPercent(e.target.value)}
            required
            className="w-24 rounded border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
          />
        </label>
        <label className="flex flex-col text-xs text-black/60 dark:text-white/60">
          Minutes (optional)
          <input
            type="number"
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(e.target.value)}
            className="w-28 rounded border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-50"
        >
          Log progress
        </button>
      </form>

      {pace && (pace.perDay !== null || pace.perHour !== null) ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          Pace: {pace.perDay !== null ? `${pace.perDay.toFixed(1)} units/day` : null}
          {pace.perDay !== null && pace.perHour !== null ? " · " : null}
          {pace.perHour !== null ? `${pace.perHour.toFixed(1)} units/hour` : null}
        </p>
      ) : (
        <p className="text-sm text-black/40 dark:text-white/40">
          Not enough data yet to calculate pace — log entries with an hour or more
          between them, or include minutes spent reading.
        </p>
      )}

      <ul className="flex flex-col gap-1 text-sm">
        {[...logs]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((log) => (
            <li
              key={log.id}
              className="flex justify-between border-b border-black/5 py-1 dark:border-white/5"
            >
              <span>{log.pageOrPercent}</span>
              <span className="text-black/40 dark:text-white/40">
                {formatDate(log.timestamp)}
                {log.sessionMinutes ? ` · ${log.sessionMinutes} min` : ""}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
