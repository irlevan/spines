export type ProgressUnit = "pages" | "percent";

// A reader might log the same book by page one session and by percent the
// next (e.g. switching between a physical copy and an audiobook's percent
// readout). Normalizing to percent at write time means every stored log is
// directly comparable, regardless of which unit produced it.
export function resolvePercent(
  unit: ProgressUnit,
  value: number,
  pageCount: number | null
): number {
  if (unit === "pages") {
    if (!pageCount || pageCount <= 0) {
      throw new Error("This book has no page count on file, so progress must be logged in %.");
    }
    return Math.max(0, Math.min(100, (value / pageCount) * 100));
  }
  return Math.max(0, Math.min(100, value));
}
