import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bookId, pageOrPercent, sessionMinutes } = body;

  if (!bookId || typeof pageOrPercent !== "number") {
    return NextResponse.json(
      { error: "bookId and pageOrPercent are required" },
      { status: 400 }
    );
  }

  try {
    const log = await prisma.progressLog.create({
      data: { bookId, pageOrPercent, sessionMinutes },
    });
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
}
