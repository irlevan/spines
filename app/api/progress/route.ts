import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePercent, type ProgressUnit } from "@/lib/progress";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bookId, unit, value, sessionMinutes, timestamp } = body as {
    bookId?: string;
    unit?: ProgressUnit;
    value?: number;
    sessionMinutes?: number;
    timestamp?: string;
  };

  if (!bookId || (unit !== "pages" && unit !== "percent") || typeof value !== "number") {
    return NextResponse.json(
      { error: "bookId, unit (\"pages\" | \"percent\"), and value are required" },
      { status: 400 }
    );
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  let percent: number;
  try {
    percent = resolvePercent(unit, value, book.pageCount);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const log = await prisma.progressLog.create({
    data: {
      bookId,
      percent,
      sessionMinutes,
      timestamp: timestamp ? new Date(timestamp) : undefined,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
