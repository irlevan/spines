"use client";

import { useState } from "react";
import type { ProgressLog } from "@prisma/client";
import ProgressRibbon from "./ProgressRibbon";
import { latestProgressPercent } from "@/lib/stats";

interface ProgressLoggerProps {
  bookId: string;
  initialLogs: ProgressLog[];
  pageCount: number | null;
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString();
}

// datetime-local inputs want "YYYY-MM-DDTHH:mm" in local time, not an ISO string.
function toDateTimeLocal(d: Date | string) {
  const date = new Date(d);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function computePace(logs: ProgressLog[]) {
  if (logs.length < 2) return null;
  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const deltaPercent = last.percent - first.percent;
  const deltaDays =
    (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) /
    (1000 * 60 * 60 * 24);
  const totalMinutes = sorted.reduce((sum, l) => sum + (l.sessionMinutes ?? 0), 0);

  // Require at least an hour of spread between the first and last log so a
  // pair of entries logged seconds apart doesn't produce a huge, meaningless rate.
  const MIN_DAYS_FOR_PACE = 1 / 24;

  return {
    perDay: deltaDays >= MIN_DAYS_FOR_PACE ? deltaPercent / deltaDays : null,
    perHour: totalMinutes > 0 ? deltaPercent / (totalMinutes / 60) : null,
  };
}

export default function ProgressLogger({ bookId, initialLogs, pageCount }: ProgressLoggerProps) {
  const [logs, setLogs] = useState<ProgressLog[]>(initialLogs);
  const [unit, setUnit] = useState<"pages" | "percent">(pageCount ? "pages" : "percent");
  const [value, setValue] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState("");
  const [when, setWhen] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const pace = computePace(logs);
  const percent = latestProgressPercent(logs);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          unit,
          value: Number(value),
          sessionMinutes: sessionMinutes ? Number(sessionMinutes) : undefined,
          timestamp: when ? new Date(when).toISOString() : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Couldn't log that.");
        return;
      }
      const log: ProgressLog = await res.json();
      setLogs((prev) => [...prev, log]);
      setValue("");
      setSessionMinutes("");
      setWhen("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDateEdit(logId: string, newDate: string) {
    if (!newDate) return;
    const timestamp = new Date(newDate).toISOString();
    setLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, timestamp: new Date(timestamp) } : l)));
    setEditingLogId(null);
    await fetch(`/api/progress/${logId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp }),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1 text-xs text-muted">
          Counting in
          <div className="input flex w-fit overflow-hidden rounded-lg p-0.5">
            {(["pages", "percent"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setUnit(option)}
                disabled={option === "pages" && !pageCount}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  unit === option ? "bg-ribbon text-on-ribbon" : "text-muted"
                }`}
              >
                {option === "pages" ? "Pages" : "%"}
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-xs text-muted">
          {unit === "pages" ? "Page reached" : "% reached"}
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
        <label className="flex flex-col gap-1 text-xs text-muted">
          When (optional, defaults to now)
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="input w-44 rounded-lg px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="btn-ribbon rounded-lg px-3.5 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          Log progress
        </button>
      </form>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {logs.length > 0 ? (
        <div className="flex items-center gap-3">
          <ProgressRibbon percent={percent} variant="horizontal" className="max-w-xs" />
          <span className="font-data shrink-0 text-xs text-subtle">{Math.round(percent)}%</span>
        </div>
      ) : null}

      {pace && (pace.perDay !== null || pace.perHour !== null) ? (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
          Pace: {pace.perDay !== null ? `${pace.perDay.toFixed(1)}%/day` : null}
          {pace.perDay !== null && pace.perHour !== null ? " · " : null}
          {pace.perHour !== null ? `${pace.perHour.toFixed(1)}%/hour` : null}
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
            <li key={log.id} className="flex items-center justify-between gap-2 py-2">
              <span className="font-data font-medium">{Math.round(log.percent)}%</span>
              {editingLogId === log.id ? (
                <input
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(log.timestamp)}
                  autoFocus
                  onBlur={(e) => handleDateEdit(log.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDateEdit(log.id, e.currentTarget.value);
                    if (e.key === "Escape") setEditingLogId(null);
                  }}
                  className="input rounded-md px-2 py-0.5 text-xs"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingLogId(log.id)}
                  className="text-subtle underline-offset-2 hover:text-ribbon hover:underline"
                >
                  {formatDate(log.timestamp)}
                  {log.sessionMinutes ? ` · ${log.sessionMinutes} min` : ""}
                </button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
