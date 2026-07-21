import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { searchOpenLibrary } from "@/lib/openLibrary";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (q) {
    const results = await searchOpenLibrary(q);
    return NextResponse.json(results);
  }

  const shelf = searchParams.get("shelf");
  const books = await prisma.book.findMany({
    where: shelf ? { shelf } : undefined,
    orderBy: { dateAdded: "desc" },
  });
  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, author, isbn, coverUrl, pageCount, publisher, format, shelf, openLibraryKey } =
    body;

  if (!title || !author) {
    return NextResponse.json({ error: "title and author are required" }, { status: 400 });
  }

  const book = await prisma.book.create({
    data: { title, author, isbn, coverUrl, pageCount, publisher, format, shelf, openLibraryKey },
  });

  revalidatePath("/");
  revalidatePath("/library");

  return NextResponse.json(book, { status: 201 });
}
