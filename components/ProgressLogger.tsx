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
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Page or %
          <input
            type="number"
            value={pageOrPercent}
            onChange={(e) => setPageOrPercent(e.target.value)}
            required
            className="input w-24 rounded-lg px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Minutes (optional)
          <input
            type="number"
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(e.target.value)}
            className="input w-28 rounded-lg px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="btn-accent rounded-lg px-3.5 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          Log progress
        </button>
      </form>

      {pace && (pace.perDay !== null || pace.perHour !== null) ? (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
          Pace: {pace.perDay !== null ? `${pace.perDay.toFixed(1)} units/day` : null}
          {pace.perDay !== null && pace.perHour !== null ? " · " : null}
          {pace.perHour !== null ? `${pace.perHour.toFixed(1)} units/hour` : null}
        </p>
      ) : (
        <p className="text-sm text-subtle">
          Not enough data yet to calculate pace — log entries with an hour or more
          between them, or include minutes spent reading.
        </p>
      )}

      <ul className="flex flex-col divide-y divide-line text-sm">
        {[...logs]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((log) => (
            <li key={log.id} className="flex justify-between py-2">
              <span className="font-medium">{log.pageOrPercent}</span>
              <span className="text-subtle">
                {formatDate(log.timestamp)}
                {log.sessionMinutes ? ` · ${log.sessionMinutes} min` : ""}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
