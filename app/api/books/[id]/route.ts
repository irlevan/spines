import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UPDATABLE_FIELDS = [
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
  "favorite",
  "dateStarted",
  "dateFinished",
] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      progressLogs: { orderBy: { timestamp: "asc" } },
      quotes: true,
    },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json(book);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  if (typeof data.dateStarted === "string") data.dateStarted = new Date(data.dateStarted);
  if (typeof data.dateFinished === "string") data.dateFinished = new Date(data.dateFinished);

  try {
    const book = await prisma.book.update({ where: { id }, data });
    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
}
