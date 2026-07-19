import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bookId, text, page, note } = body;

  if (!bookId || !text) {
    return NextResponse.json({ error: "bookId and text are required" }, { status: 400 });
  }

  try {
    const quote = await prisma.quote.create({
      data: { bookId, text, page, note },
    });
    return NextResponse.json(quote, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
}
