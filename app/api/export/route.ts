import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CSV_FIELDS = [
  "id",
  "title",
  "author",
  "isbn",
  "coverUrl",
  "pageCount",
  "format",
  "shelf",
  "rating",
  "moodTags",
  "paceTag",
  "reviewText",
  "dateAdded",
  "dateStarted",
  "dateFinished",
] as const;

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str: string;
  if (value instanceof Date) {
    str = value.toISOString();
  } else if (Array.isArray(value)) {
    str = value.join(";");
  } else {
    str = String(value);
  }
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(books: Record<string, unknown>[]): string {
  const rows = books.map((book) => CSV_FIELDS.map((field) => escapeCsvValue(book[field])).join(","));
  return [CSV_FIELDS.join(","), ...rows].join("\n");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "csv" ? "csv" : "json";

  const books = await prisma.book.findMany({
    include: { progressLogs: true, quotes: true },
    orderBy: { dateAdded: "asc" },
  });

  if (format === "csv") {
    return new NextResponse(toCsv(books), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=spines-library.csv",
      },
    });
  }

  return new NextResponse(JSON.stringify(books, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=spines-library.json",
    },
  });
}
