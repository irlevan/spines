export interface ImportedBook {
  title: string;
  author: string;
  isbn: string | null;
  rating: number | null;
  shelf: string;
  format: string;
  dateFinished: Date | null;
  reviewText: string | null;
  moodTags: string[];
  paceTag: string | null;
}

export interface ImportParseResult {
  source: "goodreads" | "storygraph";
  books: ImportedBook[];
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function toRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    header.forEach((key, i) => {
      record[key] = (row[i] ?? "").trim();
    });
    return record;
  });
}

// Goodreads wraps some fields in ="..." to stop spreadsheet apps mangling them.
function cleanExcelEscape(value: string): string {
  const match = value.match(/^="(.*)"$/);
  return match ? match[1] : value;
}

function roundToQuarter(value: number): number {
  return Math.round(value * 4) / 4;
}

function cleanIsbn(value: string): string | null {
  const cleaned = cleanExcelEscape(value).replace(/[^0-9Xx]/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

function parseGoodreadsDate(value: string): Date | null {
  if (!value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapGoodreadsShelf(exclusiveShelf: string): string {
  switch (exclusiveShelf.trim().toLowerCase()) {
    case "currently-reading":
      return "reading";
    case "read":
      return "read";
    default:
      return "want_to_read";
  }
}

function mapGoodreadsFormat(binding: string): string {
  const b = binding.trim().toLowerCase();
  if (b.includes("audio")) return "audiobook";
  if (b.includes("ebook") || b.includes("kindle")) return "ebook";
  return "physical";
}

function parseGoodreads(records: Record<string, string>[]): ImportedBook[] {
  return records
    .filter((r) => r["Title"])
    .map((r) => {
      const rating = Number(r["My Rating"] ?? "0");
      return {
        title: r["Title"],
        author: r["Author"] || "Unknown",
        isbn: cleanIsbn(r["ISBN13"] || r["ISBN"] || ""),
        rating: rating > 0 ? roundToQuarter(rating) : null,
        shelf: mapGoodreadsShelf(r["Exclusive Shelf"] ?? ""),
        format: mapGoodreadsFormat(r["Binding"] ?? ""),
        dateFinished: parseGoodreadsDate(r["Date Read"] ?? ""),
        reviewText: r["My Review"] || null,
        moodTags: [],
        paceTag: null,
      };
    });
}

function mapStoryGraphShelf(readStatus: string): string {
  switch (readStatus.trim().toLowerCase()) {
    case "currently-reading":
      return "reading";
    case "read":
      return "read";
    case "did-not-finish":
      return "dnf";
    default:
      return "want_to_read";
  }
}

function mapStoryGraphFormat(format: string): string {
  const f = format.trim().toLowerCase();
  if (f.includes("audio")) return "audiobook";
  if (f.includes("ebook") || f.includes("e-book")) return "ebook";
  return "physical";
}

function parseStoryGraphDate(value: string): Date | null {
  if (!value.trim()) return null;
  // "Dates Read" can hold multiple comma-separated reads; take the last one.
  const last = value.split(",").map((d) => d.trim()).filter(Boolean).pop();
  if (!last) return null;
  const parsed = new Date(last);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTagList(value: string): string[] {
  return value
    .split(/[,|]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function parseStoryGraph(records: Record<string, string>[]): ImportedBook[] {
  return records
    .filter((r) => r["Title"])
    .map((r) => {
      const rating = Number(r["Star Rating"] ?? "0");
      return {
        title: r["Title"],
        author: r["Authors"] || "Unknown",
        isbn: cleanIsbn(r["ISBN/UID"] ?? ""),
        rating: rating > 0 ? roundToQuarter(rating) : null,
        shelf: mapStoryGraphShelf(r["Read Status"] ?? ""),
        format: mapStoryGraphFormat(r["Format"] ?? ""),
        dateFinished: parseStoryGraphDate(r["Last Date Read"] || r["Dates Read"] || ""),
        reviewText: r["Review"] || null,
        moodTags: parseTagList(r["Moods"] ?? ""),
        paceTag: r["Pace"]?.trim().toLowerCase() || null,
      };
    });
}

export function parseImportCsv(text: string): ImportParseResult {
  const rows = parseCsv(text);
  const records = toRecords(rows);
  const header = rows[0]?.map((h) => h.trim()) ?? [];

  if (header.includes("Exclusive Shelf")) {
    return { source: "goodreads", books: parseGoodreads(records) };
  }
  if (header.includes("Read Status")) {
    return { source: "storygraph", books: parseStoryGraph(records) };
  }

  throw new Error(
    "Couldn't recognize this file as a Goodreads or StoryGraph export. Expected a column named \"Exclusive Shelf\" (Goodreads) or \"Read Status\" (StoryGraph)."
  );
}
